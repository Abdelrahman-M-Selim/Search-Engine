import asyncio
import json
import logging
from typing import Optional
from aiokafka import AIOKafkaConsumer
from app.config import get_settings
from app.indexer import fetch_page_by_id, index_page

logger = logging.getLogger(__name__)

# Consumer instance and background task references
kafka_consumer: Optional[AIOKafkaConsumer] = None
consumer_task: Optional[asyncio.Task] = None
_is_connected: bool = False


def is_kafka_connected() -> bool:
    """Check if Kafka consumer is connected and running."""
    return _is_connected


async def process_message(data: dict) -> None:
    """Process a page_crawled message payload."""
    try:
        page_id = data.get("page_id")
        url = data.get("url")

        if not page_id:
            logger.warning("Received invalid page_crawled event without page_id: %s", data)
            return

        logger.info("Processing page_crawled event for page_id: %s, url: %s", page_id, url)

        # If full content is passed in event payload, use it directly
        content = data.get("content")
        title = data.get("title", "")

        # Otherwise fetch content from DB
        if not content:
            page_data = await fetch_page_by_id(page_id)
            if page_data:
                content = page_data.get("content", "")
                title = page_data.get("title", "")
                url = page_data.get("url", url)

        if not content:
            logger.warning("No content available to index for page_id: %s", page_id)
            return

        await index_page(page_id=page_id, content=content, title=title, url=url)

    except Exception as exc:
        logger.error("Error processing page_crawled event: %s", exc)


async def consume_loop() -> None:
    """Continuous Kafka consumer loop."""
    global kafka_consumer, _is_connected
    settings = get_settings()

    while True:
        try:
            logger.info(
                "Connecting to Kafka broker at %s for topic '%s'...",
                settings.KAFKA_BROKER,
                settings.PAGE_CRAWLED_TOPIC,
            )
            kafka_consumer = AIOKafkaConsumer(
                settings.PAGE_CRAWLED_TOPIC,
                bootstrap_servers=settings.KAFKA_BROKER,
                group_id=settings.KAFKA_GROUP_ID,
                auto_offset_reset=settings.KAFKA_AUTO_OFFSET_RESET,
                enable_auto_commit=True,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            )
            await kafka_consumer.start()
            _is_connected = True
            logger.info("Kafka consumer connected and listening on '%s'.", settings.PAGE_CRAWLED_TOPIC)

            async for msg in kafka_consumer:
                try:
                    await process_message(msg.value)
                except Exception as exc:
                    logger.error("Failed handling Kafka message offset %s: %s", msg.offset, exc)

        except asyncio.CancelledError:
            logger.info("Kafka consumer loop cancelled.")
            break
        except Exception as exc:
            _is_connected = False
            logger.warning(
                "Kafka connection failed or dropped (%s). Retrying in 10 seconds...",
                exc,
            )
            if kafka_consumer:
                try:
                    await kafka_consumer.stop()
                except Exception:
                    pass
                kafka_consumer = None
            await asyncio.sleep(10)


async def start_kafka_consumer() -> None:
    """Start Kafka consumer as an asynchronous background task."""
    global consumer_task
    consumer_task = asyncio.create_task(consume_loop())


async def stop_kafka_consumer() -> None:
    """Stop the Kafka consumer and cancel background task."""
    global kafka_consumer, consumer_task, _is_connected
    _is_connected = False
    if consumer_task:
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            pass
    if kafka_consumer:
        try:
            await kafka_consumer.stop()
            logger.info("Kafka consumer stopped.")
        except Exception as exc:
            logger.warning("Error stopping Kafka consumer: %s", exc)

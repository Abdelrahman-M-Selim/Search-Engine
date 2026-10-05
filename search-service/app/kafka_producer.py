import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from aiokafka import AIOKafkaProducer
from app.config import get_settings

logger = logging.getLogger(__name__)

kafka_producer: Optional[AIOKafkaProducer] = None


async def init_kafka_producer() -> None:
    """Initialize the Kafka producer client."""
    global kafka_producer
    settings = get_settings()
    try:
        kafka_producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKER,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        )
        await kafka_producer.start()
        logger.info("Kafka producer started successfully.")
    except Exception as exc:
        logger.warning("Kafka producer connection failed on startup: %s", exc)
        kafka_producer = None


async def close_kafka_producer() -> None:
    """Stop the Kafka producer client."""
    global kafka_producer
    if kafka_producer:
        try:
            await kafka_producer.stop()
            logger.info("Kafka producer stopped.")
        except Exception as exc:
            logger.warning("Error stopping Kafka producer: %s", exc)


async def publish_search_performed(
    query: str,
    result_count: int,
    user_id: Optional[str] = None,
) -> None:
    """
    Publish a search_performed event to Kafka (fire-and-forget / fail-open).
    """
    global kafka_producer
    if not kafka_producer:
        return

    settings = get_settings()
    payload: Dict[str, Any] = {
        "query": query,
        "result_count": result_count,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
    }

    try:
        await kafka_producer.send_and_wait(
            settings.SEARCH_PERFORMED_TOPIC,
            payload,
        )
        logger.debug("Published search_performed event for query='%s'", query)
    except Exception as exc:
        logger.warning("Failed to publish search_performed event to Kafka: %s", exc)

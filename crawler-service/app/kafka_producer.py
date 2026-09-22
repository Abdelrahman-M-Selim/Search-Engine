from aiokafka import AIOKafkaProducer
import json
from app.config import settings

class KafkaProducerClient:
    def __init__(self):
        self.producer = None

    async def start(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.kafka_broker,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.producer.start()

    async def stop(self):
        if self.producer:
            await self.producer.stop()

    async def send_crawled_page(self, page_id: int, url: str):
        payload = {
            "page_id": page_id,
            "url": url
        }
        await self.producer.send_and_wait(settings.page_crawled_topic, payload)

kafka_client = KafkaProducerClient()

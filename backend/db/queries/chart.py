from db.models.chart import Chart
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, List


class ChartQuery:
    @staticmethod
    def get_chart_by_uuid(db: Session, uuid: UUID) -> Chart:
        return db.query(Chart).filter(Chart.uuid == uuid).first()

    @staticmethod
    def get_chart_by_chat_uuid(db: Session, chat_uuid: UUID) -> List[Chart]:
        return db.query(Chart).filter(Chart.chat_uuid == chat_uuid).all()

    @staticmethod
    def create_chart(
        db: Session,
        chat_uuid: UUID,
        chart_type: str,
        code: str,
        data: Dict,
        caption: str,
    ) -> Chart:

        for i in range(len(data)):
            for key, value in data[i].items():
                if key.lower() != "label" and not isinstance(value, float):
                    data[i][key] = float(value)

        chart = Chart(
            chat_uuid=chat_uuid,
            chart_type=chart_type,
            code=code,
            data=data,
            caption=caption,
        )
        db.add(chart)
        db.flush()
        return chart

    @staticmethod
    def update_chart_by_uuid(
        db: Session, uuid: UUID, chart_type: str, code: str, data: Dict, caption: str
    ) -> Chart:
        chart = ChartQuery.get_chart_by_uuid(db, uuid)
        if not chart:
            return None

        chart.chart_type = chart_type
        chart.code = code
        chart.data = data
        chart.caption = caption
        db.flush()
        return chart

    @staticmethod
    def delete_chart_by_uuid(db: Session, uuid: UUID) -> bool:
        chart = ChartQuery.get_chart_by_uuid(db, uuid)
        if not chart:
            return False

        db.delete(chart)
        db.flush()
        return True

    @staticmethod
    def delete_chart_by_chat_uuid(db: Session, chat_uuid: UUID) -> bool:
        charts = ChartQuery.get_chart_by_chat_uuid(db, chat_uuid)
        if not charts:
            return False

        for chart in charts:
            db.delete(chart)
        db.flush()
        return True

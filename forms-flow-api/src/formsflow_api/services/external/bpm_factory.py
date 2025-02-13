from flask import current_app

from . import BPMService, SpiffBPMService, BaseBPMService


class BpmFactory:
    @staticmethod
    def get_bpm_service() -> BaseBPMService:
        """Return Camunda or Spiff BPM service class based on the environment variable."""
        bpm: BaseBPMService = SpiffBPMService if current_app.config.get('USE_SPIFF_WF') else BPMService
        return bpm

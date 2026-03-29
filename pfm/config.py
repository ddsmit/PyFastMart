import os
import toml
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SiteInfo:
    name: str = "My Store"
    title: str = "Welcome to My Store"
    description: str = "Quality products at great prices"
    contact_email: str = ""
    contact_phone: str = ""
    socials: dict = field(default_factory=dict)


@dataclass
class StripeConfig:
    publishable_key: str = ""
    secret_key: str = ""
    webhook_secret: str = ""


class Config:
    DEFAULT_CONFIG_PATH = Path("config.toml")

    def __init__(self, config_path: Optional[Path] = None):
        self.config_path = config_path or self.DEFAULT_CONFIG_PATH
        self.site = SiteInfo()
        self.stripe = StripeConfig()
        self.load()

    def load(self):
        if self.config_path.exists():
            data = toml.load(self.config_path)
            if "site" in data:
                for key, value in data["site"].items():
                    if hasattr(self.site, key):
                        setattr(self.site, key, value)
            if "stripe" in data:
                for key, value in data["stripe"].items():
                    if hasattr(self.stripe, key):
                        setattr(self.stripe, key, value)
        self._load_env()

    def _load_env(self):
        from dotenv import load_dotenv

        load_dotenv()

        stripe_pk = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
        stripe_sk = os.getenv("STRIPE_SECRET_KEY", "")
        stripe_wh = os.getenv("STRIPE_WEBHOOK_SECRET", "")

        if stripe_pk:
            self.stripe.publishable_key = stripe_pk
        if stripe_sk:
            self.stripe.secret_key = stripe_sk
        if stripe_wh:
            self.stripe.webhook_secret = stripe_wh

    def save(self):
        data = {
            "site": {
                "name": self.site.name,
                "title": self.site.title,
                "description": self.site.description,
                "contact_email": self.site.contact_email,
                "contact_phone": self.site.contact_phone,
                "socials": self.site.socials,
            }
        }
        with open(self.config_path, "w") as f:
            toml.dump(data, f)

    def get_site_data(self) -> dict:
        return {
            "name": self.site.name,
            "title": self.site.title,
            "description": self.site.description,
            "contact": {
                "email": self.site.contact_email,
                "phone": self.site.contact_phone,
                "socials": self.site.socials,
            },
            "stripe_publishable_key": self.stripe.publishable_key,
        }

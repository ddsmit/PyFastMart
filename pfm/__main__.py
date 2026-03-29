import typer
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt
from pfm.config import Config

app = typer.Typer(help="PyFastMart - Minimal cart implementation")
console = Console()


@app.command()
def manage(
    config_path: str = typer.Option("config.toml", help="Path to config file"),
):
    console.print("[bold]PyFastMart Store Setup[/bold]")
    console.print("=" * 40)

    config = Config(Path(config_path))

    console.print("\n[bold cyan]Business Information[/bold cyan]")
    config.site.name = Prompt.ask("Business name", default=config.site.name)
    config.site.title = Prompt.ask("Store title", default=config.site.title)
    config.site.description = Prompt.ask(
        "Store description", default=config.site.description
    )

    console.print("\n[bold cyan]Contact Information[/bold cyan]")
    config.site.contact_email = Prompt.ask(
        "Contact email", default=config.site.contact_email
    )
    config.site.contact_phone = Prompt.ask(
        "Contact phone", default=config.site.contact_phone
    )

    console.print("\n[bold cyan]Social Links[/bold cyan]")
    config.site.socials["twitter"] = Prompt.ask(
        "Twitter/X URL", default=config.site.socials.get("twitter", "")
    )
    config.site.socials["instagram"] = Prompt.ask(
        "Instagram URL", default=config.site.socials.get("instagram", "")
    )
    config.site.socials["facebook"] = Prompt.ask(
        "Facebook URL", default=config.site.socials.get("facebook", "")
    )

    console.print("\n[bold cyan]Stripe Configuration[/bold cyan]")
    console.print("Get your API keys from: https://dashboard.stripe.com/apikeys")
    config.stripe.publishable_key = Prompt.ask(
        "Stripe publishable key",
        default=config.stripe.publishable_key,
    )
    config.stripe.secret_key = Prompt.ask(
        "Stripe secret key",
        default=config.stripe.secret_key,
    )

    config.save()
    console.print("\n[bold green]Configuration saved![/bold green]")

    console.print("\n[bold cyan]Environment Variables[/bold cyan]")
    env_file = Path(".env")
    env_content = f"""STRIPE_PUBLISHABLE_KEY={config.stripe.publishable_key}
STRIPE_SECRET_KEY={config.stripe.secret_key}
"""
    env_file.write_text(env_content)
    console.print("Created .env file with Stripe keys.")

    console.print("\n[bold green]Setup complete![/bold green]")
    console.print("Run 'pfm serve' to start the server.")


@app.command()
def serve(
    host: str = typer.Option("0.0.0.0", help="Host to bind to"),
    port: int = typer.Option(8000, help="Port to bind to"),
):
    from pfm.main import app
    import uvicorn

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    app()

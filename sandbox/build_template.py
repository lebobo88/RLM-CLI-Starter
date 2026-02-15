"""E2B template builder for custom pre-configured sandbox environments.

Usage:
    python build_template.py --name my-template --dockerfile ./Dockerfile

This script uses the E2B CLI to build and register custom sandbox templates
with pre-installed tools (Node.js, Python, etc.).
"""

import argparse
import subprocess
import sys


def build_template(name: str, dockerfile: str = "Dockerfile") -> None:
    """Build an E2B sandbox template from a Dockerfile."""
    cmd = ["e2b", "template", "build", "--name", name, "--dockerfile", dockerfile]
    print(f"Building template: {name}")
    print(f"Command: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=False)
    if result.returncode != 0:
        print(f"Error: Template build failed with exit code {result.returncode}")
        sys.exit(1)
    print(f"Template '{name}' built successfully")


def list_templates() -> None:
    """List available E2B templates."""
    subprocess.run(["e2b", "template", "list"])


def main() -> None:
    parser = argparse.ArgumentParser(description="Build E2B sandbox templates")
    sub = parser.add_subparsers(dest="command")

    build = sub.add_parser("build", help="Build a template from Dockerfile")
    build.add_argument("--name", required=True, help="Template name")
    build.add_argument("--dockerfile", default="Dockerfile", help="Path to Dockerfile")

    sub.add_parser("list", help="List available templates")

    args = parser.parse_args()

    if args.command == "build":
        build_template(args.name, args.dockerfile)
    elif args.command == "list":
        list_templates()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

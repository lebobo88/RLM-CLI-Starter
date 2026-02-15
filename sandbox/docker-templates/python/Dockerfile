FROM python:3.12-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash -u 1000 user || true

WORKDIR /workspace
RUN chown 1000:1000 /workspace

CMD ["sleep", "infinity"]

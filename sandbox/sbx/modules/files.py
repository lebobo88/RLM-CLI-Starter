"""File operation helpers for sandboxes."""

import os
from pathlib import Path

from sbx.provider import SandboxInstance


def list_files(sbx: SandboxInstance, path: str) -> list:
    """List files and directories at a path inside the sandbox."""
    return sbx.filesystem.list(path)


def read_file(sbx: SandboxInstance, path: str) -> str:
    """Read a file's content from the sandbox."""
    return sbx.filesystem.read(path)


def write_file(sbx: SandboxInstance, path: str, content: str) -> None:
    """Write content to a file in the sandbox."""
    sbx.filesystem.write(path, content)


def upload_file(sbx: SandboxInstance, local_path: str, remote_path: str) -> None:
    """Upload a local file to the sandbox."""
    with open(local_path, "rb") as f:
        sbx.filesystem.write_bytes(remote_path, f.read())


def download_file(sbx: SandboxInstance, remote_path: str, local_path: str) -> None:
    """Download a file from the sandbox to local filesystem."""
    content = sbx.filesystem.read_bytes(remote_path)
    Path(local_path).parent.mkdir(parents=True, exist_ok=True)
    with open(local_path, "wb") as f:
        f.write(content)


def upload_dir(sbx: SandboxInstance, local_dir: str, remote_dir: str) -> int:
    """Recursively upload a local directory to the sandbox. Returns file count."""
    count = 0
    for root, _dirs, filenames in os.walk(local_dir):
        for fname in filenames:
            local_path = os.path.join(root, fname)
            rel_path = os.path.relpath(local_path, local_dir).replace("\\", "/")
            remote_path = f"{remote_dir}/{rel_path}"
            upload_file(sbx, local_path, remote_path)
            count += 1
    return count


def download_dir(sbx: SandboxInstance, remote_dir: str, local_dir: str) -> int:
    """Recursively download a sandbox directory to local. Returns file count."""
    count = 0
    entries = sbx.filesystem.list(remote_dir)
    for entry in entries:
        remote_path = f"{remote_dir}/{entry.name}"
        local_path = os.path.join(local_dir, entry.name)
        if getattr(entry, "is_dir", False):
            count += download_dir(sbx, remote_path, local_path)
        else:
            download_file(sbx, remote_path, local_path)
            count += 1
    return count


def file_exists(sbx: SandboxInstance, path: str) -> bool:
    """Check if a file exists in the sandbox."""
    try:
        sbx.filesystem.read(path)
        return True
    except Exception:
        return False


def file_info(sbx: SandboxInstance, path: str) -> dict:
    """Get metadata about a file in the sandbox."""
    result = sbx.commands.run(f"stat --format='%s %Y %A %U' {path}")
    if result.exit_code != 0:
        return {"error": "File not found or not accessible"}
    parts = result.stdout.strip().split()
    if len(parts) >= 4:
        return {
            "size": parts[0],
            "modified": parts[1],
            "permissions": parts[2],
            "owner": parts[3],
        }
    return {"raw": result.stdout.strip()}


def mkdir_in_sandbox(sbx: SandboxInstance, path: str) -> None:
    """Create a directory in the sandbox."""
    sbx.filesystem.make_dir(path)


def remove_in_sandbox(sbx: SandboxInstance, path: str) -> None:
    """Remove a file or directory in the sandbox."""
    sbx.filesystem.remove(path)


def move_in_sandbox(sbx: SandboxInstance, src: str, dst: str) -> None:
    """Move/rename a file in the sandbox."""
    content = sbx.filesystem.read(src)
    sbx.filesystem.write(dst, content)
    sbx.filesystem.remove(src)

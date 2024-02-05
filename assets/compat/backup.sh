#!/bin/sh
# Multi-path backup script
set -e

if [ "$1" = "create" ]; then
    shift
    backup_type="create"
elif [ "$1" = "restore" ]; then
    shift
    backup_type="restore"
else
    echo "Usage: $0 [create|restore] [dir1] [dir2] ..."
    exit 1
fi

backup_dir="/mnt/backup"

for dir in "$@"; do
    if [ ! -d "$dir" ]; then
        echo "Error: Directory '$dir' does not exist."
        exit 1
    fi

    target_dir="$backup_dir/$(basename "$dir")"

    mkdir -p "$target_dir"

    case "$backup_type" in
        create)
            compat duplicity create "$target_dir" "$dir"
            ;;
        restore)
            compat duplicity restore "$target_dir" "$dir"
            ;;
    esac
done

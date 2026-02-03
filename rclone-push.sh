#!/bin/bash
if ! rclone check time2task.SYNC_FILE onedriveperso:Documents/dev/ >/dev/null 2>&1; then
    # modification détectée
    echo "onedrive et local désynchronisé"
    exit 1
fi

# avoid newline
echo -n "$(date --rfc-3339=seconds)" > time2task.SYNC_FILE
tar cf ../time2task.tar.gz --exclude=node_modules  .
rclone move --update --progress ../time2task.tar.gz onedriveperso:Documents/dev/
rclone copy --update --progress ./time2task.SYNC_FILE onedriveperso:Documents/dev/

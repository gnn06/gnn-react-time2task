#!/bin/bash
if ! rclone check time2task.SYNC_FILE onedriveperso:Documents/dev/ >/dev/null 2>&1; then
    # modification détectée
    echo "local et onedrive désynchronisé"
    echo -n "local : "
    cat time2task.SYNC_FILE
    echo -n "remote : "
    rclone cat onedriveperso:Documents/dev/time2task.SYNC_FILE
    echo ""
    git log --after="$(awk '{print $1, $2}' time2task.SYNC_FILE)" --format="%h %ad %s" --date=short
else
    # modification détectée
    echo -n "onedrive et local synchro : "
    cat time2task.SYNC_FILE
    echo ""
    git log --after="$(awk '{print $1, $2}' time2task.SYNC_FILE)" --format="%h %ad %s" --date=short
fi
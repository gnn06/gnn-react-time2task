#!/bin/bash
if ! rclone check time2task.SYNC_FILE onedriveperso:Documents/dev/ >/dev/null 2>&1; then
    # modification détectée
    echo "local et onedrive désynchronisé"
    echo -n "local : "
    cat time2task.SYNC_FILE
    echo -n "remote : "
    rclone cat onedriveperso:Documents/dev/time2task.SYNC_FILE
    echo ""
else
    # modification détectée
    echo -n "onedrive et local synchro : "
    cat time2task.SYNC_FILE
    echo ""
fi
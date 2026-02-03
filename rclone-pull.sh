#!/bin/bash
rclone copy --update --verbose onedriveperso:Documents/dev/time2task.tar.gz ../ 
if [ $? -ne 0 ]; then
  echo "Erreur lors du rclone copy. Abandon." 
  exit 1
fi

find . -mindepth 1 -maxdepth 1  ! -name node_modules -exec rm -rf {} + 
tar xvf ../time2task.tar.gz 
rm ../time2task.tar.gz
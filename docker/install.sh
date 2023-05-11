#!/usr/bin/env bash

echo Configuring docker-compose and torq.conf files

# Set Torq help commands directory

printf "\n"
echo Please specify where you want to add the Torq help commands
read -p "Directory (default: ~/.torq): " TORQDIR
eval TORQDIR="${TORQDIR:=$HOME/.torq}"
echo $TORQDIR
printf "\n"

# Set web UI password
printf "\n"
stty -echo
read -p "Please set a web UI password: " UIPASSWORD

while [[ -z "$UIPASSWORD" ]]; do
  printf "\n"
  read -p "The password cannot be empty, please try again: " UIPASSWORD
done

stty echo
printf "\n"

# Set web UI port number

printf "\n"
echo Please choose a port number for the web UI.
echo NB! Umbrel users needs to use a different port than 8080. Try 8081.
read -p "Port number (default: 8080): " UI_PORT
eval UI_PORT="${UI_PORT:=8080}"

while [[ ! $UI_PORT =~ ^[0-9]+$ ]] || [[ $UI_PORT -lt 1 ]] || [[ $UI_PORT -gt 65535 ]]; do
    read -p "Invalid port number. Please enter a valid port number from 1 through 65535: " UI_PORT
done

# Set network type

printf "\n"
echo "Only run with host network when your server has a firewall and doesn't automatically open all port to the internet."
echo "You don't want the database to be accessible from the internet!"
echo "You usually want host network when you have a firewall and access the GRPC via localhost or 127.0.0.1"
echo "In all other cases bridge is the better and safer choice"
read -p "Please choose network type host or bridge (default: bridge): " NETWORK
eval NETWORK="${NETWORK:=bridge}"

while [[ "$NETWORK" != "host" ]] && [[ "$NETWORK" != "bridge" ]]; do
  printf "\n"
  read -p "Please choose network type host or bridge (default: bridge): " NETWORK
  eval NETWORK="${NETWORK:=bridge}"
done

printf "\n"

mkdir -p $TORQDIR

[ -f docker-compose.yml ] && rm docker-compose.yml

START_COMMAND='start-torq'
STOP_COMMAND='stop-torq'
UPDATE_COMMAND='update-torq'
DELETE_COMMAND='delete-torq'
TORQ_CONFIG=${TORQDIR}/torq.conf

curl --location --silent --output "${TORQ_CONFIG}"                  https://raw.githubusercontent.com/lncapital/torq/main/docker/example-torq.conf
if [[ "$NETWORK" == "host" ]]; then
  curl --location --silent --output "${TORQDIR}/docker-compose.yml" https://raw.githubusercontent.com/lncapital/torq/main/docker/example-docker-compose-host-network.yml
fi
if [[ "$NETWORK" == "bridge" ]]; then
  curl --location --silent --output "${TORQDIR}/docker-compose.yml" https://raw.githubusercontent.com/lncapital/torq/main/docker/example-docker-compose.yml
fi
curl --location --silent --output "${TORQDIR}/${START_COMMAND}"     https://raw.githubusercontent.com/lncapital/torq/main/docker/start.sh
curl --location --silent --output "${TORQDIR}/${STOP_COMMAND}"      https://raw.githubusercontent.com/lncapital/torq/main/docker/stop.sh
curl --location --silent --output "${TORQDIR}/${UPDATE_COMMAND}"    https://raw.githubusercontent.com/lncapital/torq/main/docker/update.sh
curl --location --silent --output "${TORQDIR}/${DELETE_COMMAND}"    https://raw.githubusercontent.com/lncapital/torq/main/docker/delete.sh

chmod +x $TORQDIR/$START_COMMAND
chmod +x $TORQDIR/$STOP_COMMAND
chmod +x $TORQDIR/$UPDATE_COMMAND
chmod +x $TORQDIR/$DELETE_COMMAND

# https://stackoverflow.com/questions/16745988/sed-command-with-i-option-in-place-editing-works-fine-on-ubuntu-but-not-mac
#torq.conf setup
sed -i.bak "s/<YourUIPassword>/$UIPASSWORD/g" $TORQ_CONFIG                && rm $TORQ_CONFIG.bak
sed -i.bak "s/<YourPort>/$UI_PORT/g"          $TORQ_CONFIG                && rm $TORQ_CONFIG.bak
#docker-compose.yml setup
sed -i.bak "s|<Path>|$TORQ_CONFIG|g"          $TORQDIR/docker-compose.yml && rm $TORQDIR/docker-compose.yml.bak
if [[ "$NETWORK" == "bridge" ]]; then
  sed -i.bak "s/<YourPort>/$UI_PORT/g"        $TORQDIR/docker-compose.yml && rm $TORQDIR/docker-compose.yml.bak
fi
#start-torq setup
sed -i.bak "s/<YourPort>/$UI_PORT/g"          $TORQDIR/start-torq         && rm $TORQDIR/start-torq.bak

echo 'Docker compose file (docker-compose.yml) created in '$TORQDIR
echo 'Torq configuration file (torq.conf) created in '$TORQDIR

printf "\n"

echo "We have added these scripts to ${TORQDIR}:"
echo "${START_COMMAND} (This command starts Torq)"
echo "${STOP_COMMAND} (This command stops Torq)"
echo "${UPDATE_COMMAND} (This command updates Torq)"
echo "${DELETE_COMMAND} (WARNING: This command deletes Torq _including_ all collected data!)"

printf "\n"

echo "Optional you can add these scripts to your PATH by running:"
echo "sudo ln -s ${TORQDIR}/* /usr/local/bin/"

printf "\n"

echo "Try it out now! Make sure the Docker daemon is running, and then start Torq with:"
echo "${TORQDIR}/${START_COMMAND}"

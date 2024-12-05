#!/bin/bash

psql -U postgres -d hexagon -a -f /usr/src/app/dev/init.sql
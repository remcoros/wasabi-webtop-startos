#!/usr/bin/env bash

# get rid of 'AT-SPI: Error retrieving accessibility bus address' warnings
export NO_AT_BRIDGE=1

/usr/bin/openbox-session

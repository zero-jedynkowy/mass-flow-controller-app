#ifndef INC_MFC_H_
#define INC_MFC_H_

#include <stdint.h>
#include <cJSON.h>
#include <stdbool.h>
#include "usb_device.h"

#define MAX_CHANNELS_AMOUNT 4
#define DEVICE_VERSION 0.1
#define DEVICE_NAME "Mass Flow Controller Device Prototype"


#define SIZE_1 10
#define SIZE_2 50
#define SIZE_3 500

// USB

enum
{
	TRANSMIT,
	RECEIVE,
	IDLE,
	GOT_DATA_TO_PROCESS
} typedef usb_status;

struct
{
	uint8_t receiveBuffer[SIZE_3];
	usb_status status;
} typedef Transceiver;

// MFC

struct
{

} typedef Channel;

struct
{

} typedef MFC;

#endif

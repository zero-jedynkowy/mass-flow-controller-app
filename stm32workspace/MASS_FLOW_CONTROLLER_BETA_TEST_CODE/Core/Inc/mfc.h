/*
 * mfc.h
 *
 *  Created on: May 16, 2024
 *      Author: zero-jedynkowy
 */

#ifndef INC_MFC_H_
#define INC_MFC_H_

#include <stdint.h>
#include <cJSON.h>
#include <stdbool.h>
#include "usb_device.h"

#define MAX_CHANNELS_AMOUNT 4
#define DEVICE_VERSION 0.1
#define SHORT_SIZE 10
#define MEDIUM_SIZE 50
#define BIG 500
#define DEVICE_NAME "Mass Flow Controller Device Prototype"

enum
{
	OPENED,
	CLOSED,
	CONTROLLING_FLOW
} typedef channel_mode;

struct
{
	char name[];
	char symbol[];
	double specificHeat;
	double defaultGCF;
	double parameterS;
	double currentGCF;
	double flowRate;
	bool isInGasMixture;
} typedef Gas;

struct
{
	bool isWorking;
	double currentFlow;
	double settedFlow;
	channel_mode channelStatus;
	double temperature;
} typedef Channel;

struct
{
	Channel moduleChannels[MAX_CHANNELS_AMOUNT];

} typedef MFC_Module;

void MFC_Init(MFC_Module * module);
cJSON * Channel_GetJSON_AllParameters(Channel * channel);
void MFC_GetJSON(MFC_Module * module);

#endif /* INC_MFC_H_ */

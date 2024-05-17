/*
 * mfc.c
 *
 *  Created on: May 16, 2024
 *      Author: zero-jedynkowy
 */

#include "mfc.h"




void MFC_Init(MFC_Module * module)
{

	for(int i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		module->moduleChannels[i].isWorking = false;
		module->moduleChannels[i].currentFlow = i;
		module->moduleChannels[i].settedFlow = i;
		module->moduleChannels[i].channelStatus = i;
		module->moduleChannels[i].temperature = i;
	}
}

cJSON * Channel_GetJSON_AllParameters(Channel * channel)
{
	cJSON *json = cJSON_CreateObject();
	cJSON_AddBoolToObject(json, "isWorking", channel->isWorking);
	cJSON_AddNumberToObject(json, "currentFlow", channel->currentFlow);
	cJSON_AddNumberToObject(json, "settedFlow", channel->settedFlow);
	cJSON_AddNumberToObject(json, "channelStatus", channel->channelStatus);
	cJSON_AddNumberToObject(json, "temperature", channel->temperature);


	return json;
}

void MFC_SendJSON_AllParameters(MFC_Module * module)
{
	cJSON *json = cJSON_CreateObject();

	cJSON_AddStringToObject(json, "deviceName", DEVICE_NAME);
	cJSON_AddNumberToObject(json, "deviceVersion", (double)DEVICE_VERSION);
	cJSON_AddNumberToObject(json, "channelsAmount", (double)MAX_CHANNELS_AMOUNT);
	cJSON *channelsObjects[MAX_CHANNELS_AMOUNT];

	char temp[SHORT_SIZE];

	for(int i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		channelsObjects[i] = Channel_GetJSON_AllParameters(&module->moduleChannels[i]);
		sprintf(temp, "Channel %d", i + 1);
		cJSON_AddItemToObject(json, temp, channelsObjects[i]);
	}

	char *json_str = cJSON_Print(json);
	CDC_Transmit_FS(json_str, strlen(json_str));
	cJSON_free(json_str);
	cJSON_Delete(json);
}

void MFC_SendJSON_State(MFC_Module * module, char * state)
{
	cJSON *json = cJSON_CreateObject();
	cJSON_AddStringToObject(json, "status", state);
	char *json_str = cJSON_Print(json);
	CDC_Transmit_FS(json_str, strlen(json_str));
	cJSON_free(json_str);
	cJSON_Delete(json);
}

#include "mfc.h"


// USB

void Transceiver_Init(Transceiver * myTransceiver)
{
	myTransceiver->status = IDLE;
}

void Transceiver_Send(Transceiver * myTransceiver, char *str)
{
	myTransceiver->status = TRANSMIT;
	CDC_Transmit_FS(str, strlen(str));
	myTransceiver->status = IDLE;
}


// MFC

void MFC_Init(MFC * myMFC)
{

}

void MFC_TransmitSettings(MFC * myMFC, Transceiver * myTransceiver)
{
	cJSON *json = cJSON_CreateObject();
	// BELOW USER FILL
	cJSON_AddStringToObject(json, "deviceName", DEVICE_NAME);
	cJSON_AddNumberToObject(json, "deviceVersion", (double)DEVICE_VERSION);
	cJSON_AddNumberToObject(json, "channelsSize", (double)MAX_CHANNELS_AMOUNT);
	// END USER FILL
	char *json_str = cJSON_Print(json);
	Transceiver_Send(myTransceiver, json_str);
	cJSON_free(json_str);
	cJSON_Delete(json);
}

void MFC_ProcessRequest(MFC * myMFC, Transceiver * myTransceiver)
{
	myTransceiver->status = IDLE;
	cJSON *json = cJSON_Parse(myTransceiver->receiveBuffer);
	if (json == NULL)
	{
		cJSON_Delete(json);
		return;
	}
	cJSON *item = cJSON_GetObjectItemCaseSensitive(json, "request");
	if (cJSON_IsString(item) && (item->valuestring != NULL))
	{
		char *x = item->valuestring;
		char *y = "GET_DATA";
		if(strcmp(x, y) == 0)
		{
			MFC_TransmitSettings(myMFC, myTransceiver);
		}
		else if(item->valuestring == "UPDATE_SETTINGS")
		{
			MFC_TransmitSettings(myMFC, myTransceiver);
		}
	}
	else
	{
		cJSON_Delete(json);
		return;
	}
}

//void MFC_SendJSON_AllParameters(MFC_Module * module)
//{
//	cJSON *json = cJSON_CreateObject();
//
//	cJSON_AddStringToObject(json, "deviceName", DEVICE_NAME);
//	cJSON_AddNumberToObject(json, "deviceVersion", (double)DEVICE_VERSION);
//	cJSON_AddNumberToObject(json, "channelsAmount", (double)MAX_CHANNELS_AMOUNT);
//	cJSON *channelsObjects[MAX_CHANNELS_AMOUNT];
//
//	char temp[SHORT_SIZE];
//
//	for(int i=0; i<MAX_CHANNELS_AMOUNT; i++)
//	{
//		channelsObjects[i] = Channel_GetJSON_AllParameters(&module->moduleChannels[i]);
//		sprintf(temp, "Channel %d", i + 1);
//		cJSON_AddItemToObject(json, temp, channelsObjects[i]);
//	}
//
//	char *json_str = cJSON_Print(json);
//	CDC_Transmit_FS(json_str, strlen(json_str));
//	cJSON_free(json_str);
//	cJSON_Delete(json);
//}
//
//void MFC_SendJSON_State(MFC_Module * module, char * state)
//{
//	cJSON *json = cJSON_CreateObject();
//	cJSON_AddStringToObject(json, "status", state);
//	char *json_str = cJSON_Print(json);
//	CDC_Transmit_FS(json_str, strlen(json_str));
//	cJSON_free(json_str);
//	cJSON_Delete(json);
//}

#include "mfc.h"
#include "stdio.h"

#include "cJSON.h"
#include <time.h>
extern ADC_HandleTypeDef hadc;


void MFC_Init(MFC * myMFC)
{
	for(uint8_t i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		sprintf(myMFC->channels[i].channelID, "channel_%d", i + 1);
		myMFC->channels[i].turnedOn = false;
		myMFC->channels[i].referenceTemperature = 0;
		for(uint8_t j=0; j<MAX_GASES_AMOUNT; j++)
		{
			strcpy(myMFC->channels[i].gases[j].gasFormula, "N2");
			myMFC->channels[i].gases[j].flow = 0;
			myMFC->channels[i].gases[j].gasID = 59;
		}
		myMFC->channels[i].amountGases = 1;
		myMFC->channels[i].settedFlow = 0;
		myMFC->channels[i].currentFlow = 0;
		myMFC->channels[i].channelMaxN2Flow = 50;
		myMFC->channels[i].normalGCF = 1;
		myMFC->channels[i].afterTempCalibrateGCF = 1;
		myMFC->channels[i].valveMode = MANUALLY_CLOSED;
	}
}

void MFC_SendData(MFC * myMFC, TR * myTR)
{
	cJSON *json = cJSON_CreateObject();
	cJSON_AddStringToObject(json, "deviceName", DEVICE_NAME);
	cJSON_AddNumberToObject(json, "deviceVersion", DEVICE_VERSION);
	cJSON_AddNumberToObject(json, "maxAmountGases", MAX_GASES_AMOUNT);
	cJSON_AddNumberToObject(json, "channels", MAX_CHANNELS_AMOUNT);
	cJSON *channels[MAX_CHANNELS_AMOUNT];
	uint32_t value = 0;
	for(uint8_t i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		channels[i] = cJSON_CreateObject();
		cJSON_AddBoolToObject(channels[i], "turnedOn", myMFC->channels[i].turnedOn);
		cJSON_AddNumberToObject(channels[i], "referenceTemperature", myMFC->channels[i].referenceTemperature);
		cJSON *json_array = cJSON_CreateArray();
		for(uint8_t j=0; j<MAX_GASES_AMOUNT; j++)
		{
			cJSON *gas_array = cJSON_CreateArray();
			cJSON_AddItemToArray(gas_array, cJSON_CreateNumber(myMFC->channels[i].gases[j].gasID));
			cJSON_AddItemToArray(gas_array, cJSON_CreateString(myMFC->channels[i].gases[j].gasFormula));
			cJSON_AddItemToArray(gas_array, cJSON_CreateNumber(myMFC->channels[i].gases[j].flow));
			cJSON_AddItemToArray(json_array, gas_array);
		}
		cJSON_AddItemToObject(channels[i],"gases", json_array);
		cJSON_AddNumberToObject(channels[i], "normalGCF", myMFC->channels[i].normalGCF);
		cJSON_AddNumberToObject(channels[i], "afterTempCalibrateGCF", myMFC->channels[i].afterTempCalibrateGCF);
		cJSON_AddNumberToObject(channels[i], "amountGases", myMFC->channels[i].amountGases);
		cJSON_AddNumberToObject(channels[i], "settedFlow", myMFC->channels[i].settedFlow);
		cJSON_AddNumberToObject(channels[i], "currentFlow", myMFC->channels[i].currentFlow); //rand() % 100
		cJSON_AddNumberToObject(channels[i], "channelMaxN2Flow", myMFC->channels[i].channelMaxN2Flow);
		cJSON_AddNumberToObject(channels[i], "channelMaxCurrentGasFlow", myMFC->channels[i].channelMaxCurrentGasFlow);
		cJSON_AddNumberToObject(channels[i], "valveMode", myMFC->channels[i].valveMode);
		cJSON_AddItemToObject(json, myMFC->channels[i].channelID, channels[i]);
	}
	char * str = cJSON_PrintUnformatted(json);
	TR_SendData(str);

	cJSON_free(str);
	cJSON_Delete(json);
}

void TR_Init(TR * myTR)
{
	myTR->status = IDLE;
}

bool TR_IsReceiveStatus(TR * myTR)
{
	return (GO_PROCESS_NEW_DATA ==  myTR->status);
}

void TR_SetFlag(TR * myTR, usb_state value)
{
	myTR->status = value;
}

void TR_SendData(char * str)
{
	CDC_Transmit_FS(str, strlen(str));
}

void MFC_SetSettings(MFC * myMFC, cJSON *json)
{
	for(uint8_t i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		cJSON*newObj = cJSON_GetObjectItem(json, myMFC->channels[i].channelID);
//		printf("%d\n", cJSON_IsTrue(cJSON_GetObjectItem(newObj, "turnedOn")));
		if(cJSON_IsTrue(cJSON_GetObjectItem(newObj, "turnedOn")))
		{
			myMFC->channels[i].turnedOn = true;
		}
		else
		{
			myMFC->channels[i].turnedOn = false;
		}
		myMFC->channels[i].referenceTemperature = cJSON_GetObjectItem(newObj, "referenceTemperature")->valuedouble;


		myMFC->channels[i].normalGCF = cJSON_GetObjectItem(newObj, "normalGCF")->valuedouble;
		myMFC->channels[i].afterTempCalibrateGCF = cJSON_GetObjectItem(newObj, "afterTempCalibrateGCF")->valuedouble;
		myMFC->channels[i].amountGases = cJSON_GetObjectItem(newObj, "amountGases")->valuedouble;
		myMFC->channels[i].settedFlow = cJSON_GetObjectItem(newObj, "settedFlow")->valuedouble;
		myMFC->channels[i].channelMaxN2Flow = cJSON_GetObjectItem(newObj, "channelMaxN2Flow")->valuedouble;
		myMFC->channels[i].channelMaxCurrentGasFlow = cJSON_GetObjectItem(newObj, "channelMaxCurrentGasFlow")->valuedouble;
		myMFC->channels[i].valveMode = cJSON_GetObjectItem(newObj, "valveMode")->valueint;
	}
}

void MFC_UpdateHardware(MFC * myMFC)
{
	for(uint8_t i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		if(myMFC->channels[i].turnedOn == 0)
		{
			myMFC->channels[i].currentFlow = 0;
		}
		else
		{
			HAL_ADC_Start(&hadc);
			HAL_ADC_PollForConversion(&hadc, 10);
			myMFC->channels[i].currentFlow = HAL_ADC_GetValue(&hadc);
		}
	}
}

void MFC_ProcessReceivedData(MFC * myMFC, TR * myTR)
{
	cJSON *json = cJSON_Parse(myTR->receiveBuffer);
	cJSON *request = cJSON_GetObjectItemCaseSensitive(json, "request");
	if (cJSON_IsString(request) && (request->valuestring != NULL))
	{
//		printf("%s\n", myTR->receiveBuffer);
		if(strcmp(request->valuestring, "GET_DATA") == 0)
		{
			MFC_UpdateHardware(myMFC);
			MFC_SendData(myMFC, myTR);
		}
		else if(strcmp(request->valuestring, "SET_DATA") == 0)
		{

			MFC_SetSettings(myMFC, json);
			MFC_UpdateHardware(myMFC);
			MFC_SendData(myMFC, myTR);

		}
		memset(myTR->receiveBuffer, '\0', RECEIVE_USB_DATA_BUFFER_SIZE);
	}

	cJSON_Delete(json);
}

//
//
//
//
//
//
//
//
//
//// USB
//
////void Transceiver_Init(Transceiver * myTransceiver)
////{
////	myTransceiver->status = IDLE;
////}
////
////void Transceiver_Send(Transceiver * myTransceiver, char *str)
////{
////	myTransceiver->status = TRANSMIT;
////	CDC_Transmit_FS(str, strlen(str));
////	myTransceiver->status = IDLE;
////}

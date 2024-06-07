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
		}
		myMFC->channels[i].amountGases = 1;
		myMFC->channels[i].settedFlow = 0;
		myMFC->channels[i].currentFlow = 0;
		myMFC->channels[i].channelMaxN2Flow = 50;
		myMFC->channels[i].normalGCF = 1;
		myMFC->channels[i].afterTempCalibrateGCF = 1;
		myMFC->channels[i].valveMode = AUTOMATIC;
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
		HAL_ADC_Start(&hadc);
		HAL_ADC_PollForConversion(&hadc, HAL_MAX_DELAY);
		uint32_t value = HAL_ADC_GetValue(&hadc);
		channels[i] = cJSON_CreateObject();
		cJSON_AddBoolToObject(channels[i], "turnedOn", myMFC->channels[i].turnedOn);
		cJSON_AddNumberToObject(channels[i], "referenceTemperature", myMFC->channels[i].referenceTemperature);
		cJSON *json_array = cJSON_CreateObject();
		for(uint8_t j=0; j<MAX_GASES_AMOUNT; j++)
		{
			cJSON_AddNumberToObject(json_array, myMFC->channels[i].gases[j].gasFormula, myMFC->channels[i].gases[j].flow);
		}
		cJSON_AddItemToObject(json, "gases", json_array);
		cJSON_AddNumberToObject(channels[i], "normalGCF", myMFC->channels[i].normalGCF);
		cJSON_AddNumberToObject(channels[i], "afterTempCalibrateGCF", myMFC->channels[i].afterTempCalibrateGCF);
		cJSON_AddNumberToObject(channels[i], "amountGases", myMFC->channels[i].amountGases);
		cJSON_AddNumberToObject(channels[i], "settedFlow", myMFC->channels[i].settedFlow);
//		cJSON_AddNumberToObject(channels[i], "currentFlow", myMFC->channels[i].currentFlow);
		cJSON_AddNumberToObject(channels[i], "currentFlow", value); //rand() % 100
		cJSON_AddNumberToObject(channels[i], "channelMaxN2Flow", myMFC->channels[i].channelMaxN2Flow);
		cJSON_AddNumberToObject(channels[i], "channelMaxCurrentGasFlow", myMFC->channels[i].channelMaxCurrentGasFlow);
		cJSON_AddNumberToObject(channels[i], "valveMode", myMFC->channels[i].valveMode);
		//
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


void MFC_ProcessReceivedData(MFC * myMFC, TR * myTR)
{
	cJSON *json = cJSON_Parse(myTR->receiveBuffer);
	cJSON *request = cJSON_GetObjectItemCaseSensitive(json, "request");
	if (cJSON_IsString(request) && (request->valuestring != NULL))
	{
		if(strcmp(request->valuestring, "GET_DATA") == 0)
		{
			MFC_SendData(myMFC, myTR);
		}
		else if(strcmp(request->valuestring, "SET_DATA") == 0)
		{
			printf("%d\n", 2);
		}
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

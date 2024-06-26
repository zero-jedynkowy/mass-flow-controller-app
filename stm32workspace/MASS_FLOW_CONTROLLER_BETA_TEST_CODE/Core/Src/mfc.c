#include "mfc.h"
#include "stdio.h"
#include "cJSON.h"
#include <time.h>
#include "usbd_cdc_if.h"
#include "i2c-lcd.h"

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
		myMFC->channels[i].amountGases = cJSON_GetObjectItem(newObj, "amountGases")->valueint;
		cJSON *gases_array = cJSON_GetObjectItem(newObj, "gases");
		for(uint8_t j=0; j<myMFC->channels[i].amountGases; j++)
		{
			myMFC->channels[i].gases[j].gasID = cJSON_GetArrayItem(cJSON_GetArrayItem(gases_array, j), 0)->valueint;
			strcpy(myMFC->channels[j].gases[j].gasFormula, cJSON_GetArrayItem(cJSON_GetArrayItem(gases_array, j), 1)->string);
			myMFC->channels[i].gases[j].flow = cJSON_GetArrayItem(cJSON_GetArrayItem(gases_array, j), 2)->valuedouble;
		}
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
			myMFC->channels[i].valveMode = MANUALLY_CLOSED;
		}
		else
		{
			MFC_SetValve(myMFC);
			MFC_ReadFlow(myMFC);
		}
	}
}

void MFC_SetValve(MFC * myMFC)
{
	for(uint8_t i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		switch(myMFC->channels[i].valveMode)
		{
			case AUTO_CONTROL: //0 gnd I dac
			{
				double temp = (myMFC->channels[i].settedFlow)*5;
				temp = temp/(myMFC->channels[i].channelMaxN2Flow*myMFC->channels[i].afterTempCalibrateGCF);
				//PLACEHOLDER START
				temp = (temp*4096)/5;

				HAL_GPIO_WritePin(FULL_OPEN_GPIO_Port, FULL_OPEN_Pin, 0);
				HAL_GPIO_WritePin(CLOSE_SWITCH_GPIO_Port, CLOSE_SWITCH_Pin, 0);
				HAL_Delay(10);
//				HAL_GPIO_WritePin(GND_SWITCH_GPIO_Port, GND_SWITCH_Pin, 1);
				SET_DAC((int)temp);
				//PLACEHOLDER END
				break;
			}
			case MANUALLY_CLOSED: //-15
			{
				//PLACEHOLDER START
//				HAL_GPIO_WritePin(GND_SWITCH_GPIO_Port, GND_SWITCH_Pin, 0);
				HAL_GPIO_WritePin(FULL_OPEN_GPIO_Port, FULL_OPEN_Pin, 0);
				HAL_Delay(10);
				HAL_GPIO_WritePin(CLOSE_SWITCH_GPIO_Port, CLOSE_SWITCH_Pin, 1);

				//PLACEHOLDER END
				break;
			}
			case MANUALLY_OPENED: //+5
			{
				//PLACEHOLDER START
				HAL_GPIO_WritePin(CLOSE_SWITCH_GPIO_Port, CLOSE_SWITCH_Pin, 0);
//				HAL_GPIO_WritePin(GND_SWITCH_GPIO_Port, GND_SWITCH_Pin, 0);
				HAL_Delay(10);
				HAL_GPIO_WritePin(FULL_OPEN_GPIO_Port, FULL_OPEN_Pin, 1);
				//PLACEHOLDER END
				break;
			}
		}
	}
}

void MFC_ReadFlow(MFC * myMFC)
{
	ADC_SetChannel(ADC_CHANNEL_1, ADC_RANK_NONE);
	ADC_SetChannel(ADC_CHANNEL_0, 1);
	for(uint8_t i=0; i<MAX_CHANNELS_AMOUNT; i++)
	{
		double currentFlowAsVoltage = 0;


		HAL_ADC_Start(&hadc);
		HAL_ADC_PollForConversion(&hadc, 1000);
		currentFlowAsVoltage = HAL_ADC_GetValue(&hadc)/4096.0;
		currentFlowAsVoltage *= 3.3/2.5;
		currentFlowAsVoltage *= myMFC->channels[i].channelMaxN2Flow;
		currentFlowAsVoltage *= myMFC->channels[i].afterTempCalibrateGCF;
		myMFC->channels[i].currentFlow = currentFlowAsVoltage;
	}
}

void MFC_ProcessReceivedData(MFC * myMFC, TR * myTR)
{
	cJSON *json = cJSON_Parse(myTR->receiveBuffer);
	cJSON *request = cJSON_GetObjectItemCaseSensitive(json, "request");
	if (cJSON_IsString(request) && (request->valuestring != NULL))
	{
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

void Screen_Init(Screen * myScreen)
{
	lcd_init();
	myScreen->currentScreen = 0;
	myScreen->adcValue = 0;
}

char table[16];

void Screen_Update(Screen * myScreen, MFC * myMFC)
{

	lcd_clear();
	ADC_SetChannel(ADC_CHANNEL_0, ADC_RANK_NONE);
	ADC_SetChannel(ADC_CHANNEL_1, ADC_RANK_CHANNEL_NUMBER);
	HAL_ADC_Start(&hadc);
	HAL_ADC_PollForConversion(&hadc, 1000);
	myScreen->adcValue = HAL_ADC_GetValue(&hadc);

	sprintf(table, "%d", myScreen->adcValue);

	lcd_put_cur(0, 0);
	lcd_send_string(table);

	lcd_put_cur(1, 0);
	sprintf(table, "%f", myMFC->channels[0].referenceTemperature);

	lcd_send_string(table);
	HAL_Delay(15);

}

void ADC_SetChannel(uint32_t channel, uint32_t rank)
{
    ADC_ChannelConfTypeDef sConfig = { 0 };

    sConfig.Channel      = channel;
    sConfig.Rank         = rank;
    HAL_ADC_ConfigChannel ( &hadc, &sConfig );
}

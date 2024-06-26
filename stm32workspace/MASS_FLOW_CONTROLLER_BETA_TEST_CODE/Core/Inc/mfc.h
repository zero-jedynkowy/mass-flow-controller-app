#ifndef INC_MFC_H_
#define INC_MFC_H_

#include <stdint.h>
#include <cJSON.h>
#include <stdbool.h>
#include "usb_device.h"
#include "stdio.h"

#define MAX_CHANNELS_AMOUNT 1
#define MAX_GASES_AMOUNT 5
#define DEVICE_VERSION 0.1
#define DEVICE_NAME "Mass Flow Controller Device Prototype"

#define SIZE_1 10
#define SIZE_2 50
#define SIZE_3 500
#define SIZE_4 20

#define RECEIVE_USB_DATA_BUFFER_SIZE 500

enum
{
	MANUALLY_CLOSED,
	MANUALLY_OPENED,
	AUTO_CONTROL
} typedef valve;

struct
{
	char gasFormula[SIZE_4];
	uint8_t gasID;
	double flow;
} typedef Gas;

struct
{
	//channelID: 1, 2, 3...
	char channelID[SIZE_1];
	bool turnedOn;
	double referenceTemperature;
	Gas gases[MAX_GASES_AMOUNT];
	double normalGCF;
	double afterTempCalibrateGCF;
	uint8_t amountGases;
	double settedFlow;
	double currentFlow;
	double channelMaxN2Flow;
	double channelMaxCurrentGasFlow;
	valve valveMode;
} typedef Channel;

struct
{
	//deviceName
	//deviceVersion
	//maxAmountGases
	//maxAmountChannel
	Channel channels[MAX_CHANNELS_AMOUNT];
} typedef MFC;

enum
{
	IDLE,
	GO_PROCESS_NEW_DATA
} typedef usb_state;

struct
{
	uint8_t receiveBuffer[RECEIVE_USB_DATA_BUFFER_SIZE];
	usb_state status;
} typedef TR;

struct
{
	uint32_t adcValue;
	double adcFloat;
	uint8_t currentScreen;
} typedef Screen;

void MFC_Init(MFC * myMFC);
void MFC_SendData(MFC * myMFC, TR * myTR);
void MFC_ProcessReceivedData(MFC * myMFC, TR * myTR);
void MFC_SetValve(MFC * myMFC);
void MFC_ReadFlow(MFC * myMFC);


void TR_Init(TR * myTR);
bool TR_IsReceiveStatus(TR * myTR);
void TR_SetFlag(TR *myTR, usb_state value);
void TR_SendData(char * str);

void Screen_Init(Screen * myScreen);
void Screen_Update(Screen * myScreen, MFC * myMFC);

void ADC_SetChannel(uint32_t channel, uint32_t rank);

#endif

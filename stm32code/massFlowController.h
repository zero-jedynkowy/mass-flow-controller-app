#ifndef __MASS_FLOW_CONTROLLER_H__
#define __MASS_FLOW_CONTROLLER_H__

#include <stdint.h>

#define GASES_COUNT 6

enum valve
{
    AUTOMATICALLY_CLOSED,
    AUTOMATICALLY_OPENED,
    MANUALLY_CLOSED,
    MANUALLY_OPENED,
    PERMANENT_AUTOMATICALLY_CLOSED,
    PERMANENT_AUTOMATICALLY_OPENED
};

enum gas
{
    AIR,
    AMMONIA,
    ARGON,
    ARSINE,
    BOTON_TRICHLORIDE,
    BROMINE
};

struct
{
    float specific_heat[GASES_COUNT] = {0.24, 0.492, 0.1244, 0.1167, 0.1279, 0.0539};
    float density[GASES_COUNT] = {1.293, 0.76, 1.782, 3.478, 5.227, 7.130};
    float conversion_factor[GASES_COUNT] = {1, 0.73, 1.39, 0.67, 0.41, 0.81};
} GasesParameters;


typedef struct Channel
{
    int8_t channelID;
    int8_t isTurnedON;
    valve valveStatus;
    gas channelGases[5];

} Channel;


typedef struct MassFlowController
{
    char model[20];
    int8_t maxFlow;
    gas maxFlowReferenceGas;
} MassFlowController;

#endif
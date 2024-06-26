/*
 * DAC.c
 *
 *  Created on: Jun 10, 2024
 *      Author: xenon
 */

#define SLAVE_ADDRESS_DAC 0x60 //bez uwzględnienia przesunięcia o << 1

#include "DAC.h"
#include "stdio.h"
extern I2C_HandleTypeDef hi2c1;
uint8_t data [3];

//			SET_DAC			//
//Sluzy do ustawienia nie   na stale napiecia na wyjsciu
//Jesli odlaczysz zasilanie to ta wartosc zniknie bo nie jest tutaj zapisywana w MEMORY

void SET_DAC (int resolution)
{
	data[0] = resolution>>8;
	data[1] = resolution;
	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DAC<<1, data, 2, 50);
}

//			MEMORY_SET_DAC			//
//Tutaj ustawiany DAC oraz zapisujemy to rowniez w MEMORY
//Jak przywrocisz zasilanie to napiecie ustawi sie tak jak ustawiles w MEMORY

void MEMORY_SET_DAC (int resolution)
{
	data[0] = 0x00;
	data[1] = resolution>>4;
	data[2] = resolution<<4;
	HAL_I2C_Master_Transmit(&hi2c1, SLAVE_ADDRESS_DAC<<1, data, 3, 50);
}

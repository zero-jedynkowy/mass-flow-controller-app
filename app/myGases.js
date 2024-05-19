// class Gas
// {
//     constructor(name, symbol, specific_heat, standard_density, defaultGCF, temperature)
//     {
//         this.name = name;
//         this.symbol = symbol;
//         this.specific_heat = specific_heat;
//         this.standard_density = density;
//         this.defaultGCF = defaultGCF;
//         this.temperature = temperature; //in K
//         this.s = 0; //molecular_structure_correction_factor
//         this.currentGCF = 0;
//         this.flowRate = 0;
//         this.calcNewGCF()
//         this.calcSparameter()
//     }

//     calcS()
//     {
//         let part1 = this.defaultGCF * this.density * this.specific_heat;
//         part1 /= 0.3106
//         this.s = part1;
//     }

//     calcCurrentGCF()
//     {
//         this.currentGCF = this.defaultGCF * (this.temperature/273.15)
//     }

//     setFlowRate(newValue)
//     {
//         this.flowRate = newValue
//     }
// }

// function calcGCF(s, px, cpx)
// {
//     let part1 = 0.3106 * s
//     let part2 = px*cpx
//     return part1/part2
// }

// class MixedGas
// {
//     constructor()
//     {   
//         this.gases = []
//     }

//     calcGas(gas)
//     {
//         this.gases.push(gas)
//     }

//     calcDefaultGCF()
//     {
//         let part1 = 0.3106
//         let temp = 0;
//         let sumFlowRates;
//         for(let i=0; i<this.gases.length; i++)
//         {
//             sumFlowRates += this.gases[i].flowRate
//         }
//         for(let i=0; i<this.gases.length; i++)
//         {
//             // temp += (this.gases[i].flowRate/sumFlowRates)*
//         }
//     }
// }












// function tempCtoK(value)
// {
//     return value + 273.15
// }

// function tempKtoC(value)
// {
//     return value - 273.15
// }




// module.exports = {Gas}
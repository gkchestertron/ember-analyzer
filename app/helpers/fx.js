export default {
	Chorus: {
		rate                    : 1.5,                           // 0.01 to 8+
		feedback                : 0.2,                           // 0 to 1+
		delay                   : 0.0045,                        // 0 to 1
		bypass                  : 1                              // the value 1 starts the effect as bypassed, 0 or 1
	},
	// Delay: {
	// 	feedback                : 0.45,                          // 0 to 1+
	// 	delayTime               : 150,                           // how many milliseconds should the wet signal be delayed?
	// 	wetLevel                : 0.25,                          // 0 to 1+
	// 	dryLevel                : 1,                             // 0 to 1+
	// 	cutoff                  : 20,                            // cutoff frequency of the built in highpass-filter. 20 to 22050
	// 	bypass                  : 1
	// },
	Phaser: {
		rate                    : 1.2,                           // 0.01 to 8 is a decent range, but higher values are possible
		depth                   : 0.3,                           // 0 to 1
		feedback                : 0.2,                           // 0 to 1+
		stereoPhase             : 30,                            // 0 to 180
		baseModulationFrequency : 700,                           // 500 to 1500
		bypass                  : 1
	},
	Overdrive: {
		outputGain              : 0.7,                           // 0 to 1+
		drive                   : 1,                             // 0 to 1
		curveAmount             : 0.7,                           // 0 to 1
		algorithmIndex          : 0,                             // 0 to 5, selects one of our drive algorithms
		bypass                  : 1
	},
	Compressor: {
		threshold               : 0.5,                           // -100 to 0
		makeupGain              : 1,                             // 0 and up
		attack                  : 1,                             // 0 to 1000
		release                 : 0,                             // 0 to 3000
		ratio                   : 4,                             // 1 to 20
		knee                    : 5,                             // 0 to 40
		automakeup              : true,                          // true/false
		bypass                  : 1
	},
	// Tremolo: {
	// 	intensity               : 0.3,                           // 0 to 1
	// 	rate                    : 0.1,                           // 0.001 to 8
	// 	stereoPhase             : 0,                             // 0 to 180
	// 	bypass                  : 1
	// }
}

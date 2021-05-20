var CustomElement = require("../customElement.js");

class MixChannel extends CustomElement {
	static template = require("./_mix-channel.html");
	static boundMethods = ["onPlay", "onSlide"];
	constructor() {
		super();
		var { audio, play, slider } = this.elements;
		//audio.src = './assets/synced/audio/soundscape_tech.mp3.mp3'
		play.addEventListener("click", this.onPlay);
		slider.addEventListener("input", this.onSlide);
		document.body.addEventListener("webstorypage", (d) => {
			audio.pause();
			play.setAttribute("aria-pressed", "false");
			slider.style.opacity = 1;
			audio.volume = 0;
		});
	}

	static observedAttributes = ["src"];
	attributeChangedCallback(attr, was, value) {
		switch (attr) {
			case "src":
				this.elements.audio.src = value;
				break;
		}
	}

	onSlide() {
		var { audio, slider, play } = this.elements;
		if (audio.paused) audio.play();
		// if (audio.paused){
		// 	audio.play()
		// }
		audio.volume = slider.value;
		if (slider.value > 0) {
			play.setAttribute("aria-pressed", "true");
		} else {
			play.setAttribute("aria-pressed", "false");
		}
	}

	onPlay() {
		var { audio, play, slider } = this.elements;
		if (audio.paused) {
			audio.play();
			play.setAttribute("aria-pressed", "true");
		} else {
			audio.pause();
			play.setAttribute("aria-pressed", "false");
		}
	}
}

MixChannel.define("mix-channel");

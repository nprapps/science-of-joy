var CustomElement = require("../customElement.js")

class MixChannel extends CustomElement {
	constructor(){
		super();
		var { audio,play,slider } = this.elements
		//audio.src = './assets/synced/audio/soundscape_tech.mp3.mp3'
		play.addEventListener('click', this.onPlay)
		slider.addEventListener('input', this.onSlide)
		document.body.addEventListener('webstorypage',d=> {
			audio.pause()
			play.setAttribute("aria-pressed",'false')
		})
	}
	static get observedAttributes(){
		return ['src']
	}

	static get boundMethods(){
		return ['onPlay','onSlide']
	}

	attributeChangedCallback(attr,was,value) {
		switch (attr){
			case 'src': 
				this.elements.audio.src = value;
				break
		}
	}

	onSlide(){
		var { audio, slider } = this.elements;
		audio.volume = slider.value;
	}

	onPlay(){
		var { audio, play } = this.elements;
		if (audio.paused){
				audio.play();
				play.setAttribute("aria-pressed",'true')
			}
			else {
				audio.pause();
				play.setAttribute("aria-pressed",'false')
			}
	}

	static get template(){
		return require("./_mix-channel.html")
	}
}

MixChannel.define("mix-channel")
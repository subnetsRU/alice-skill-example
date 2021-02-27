const Config = require('./config');

var randomPhrase = function (mess) {
	let res = mess;
	if (typeof mess === "object") {
		const rk = Math.floor(Math.random() * mess.length);
		res = mess[rk];
	}
	return res;
}

var objLen = function (obj) {
	if (typeof obj == 'object') {
		return Object.keys(obj).length;
	}
	return false;
}

var is_null = function (value) {
	if (typeof value == 'undefined') {
		return true;
	} else if (value === undefined) {
		return true;
	} else if (value == 'NaN') {
		return true;
	} else if (value == 0) {
		return true;
	} else if (value == '') {
		return true;
	} else if (value === null) {
		return true;
	} else if (typeof value === 'object') {
		return (objLen(value) > 0 ? false : true);
	}

	return false;
}

var makeButton = function (obj) {
	let button = {
		title: 'кнопка',
		hide: true,
	};

	if (typeof obj === "string") {
		obj = {
			title: obj,
		};
	}

	if (typeof obj.title !== "undefined") {
		if (obj.title.length > 0) {
			button.title = obj.title;
		}
		if (typeof obj.hide === "boolean") {
			button.hide = obj.hide;
		}
		if (typeof obj.payload !== "undefined" && obj.payload !== '') {
			button.payload = obj.payload;
		}
	}

	return button;
}

var defButtons = function () {
	return [
		makeButton({ title: "Повтори", hide: false }),
		makeButton("Помощь"),
		makeButton("Выход")
	];
}

var response = function sendResponse(req, obj) {
	var resp = {
		version: '1.0',
		response: {
			text: "Что-то у меня пошло не так...",
			tts: "Что-то у меня пошло не так.",
			end_session: false,
		},
	};

	if (is_null(obj)) {
		obj = {};
	}

	if (!is_null(obj.text)) {
		resp.response.text = obj.text;
	}
	resp.response.tts = resp.response.text;
	if (!is_null(obj.tts)) {
		resp.response.tts = obj.tts;
	}

	if (typeof obj.sound !== "undefined" && obj.sound) {
		resp.response.tts = obj.sound + resp.response.tts;
	}

	if (typeof obj.image !== "undefined") {
		resp.response.card = {
			type: 'BigImage',
			image_id: obj.image,
			description: resp.response.text,
			title: (typeof obj.title !== "undefined") ? obj.title : 'Изображение',
		}
	} else if (typeof obj.images === "object") {
		resp.response.card = {
			type: 'ImageGallery',
			items: [],
		}
		for (let i = 0; i < obj.images.length; i++) {
			if (obj.images[i].length > 0) {
				resp.response.card.items.push({ image_id: obj.images[i] });
			}
		}
		if (resp.response.card.items.length > 0) {
			resp.response.text = '';
		} else {
			delete resp.response.card;
		}
	}

	if (!is_null(obj.end_session)) {
		resp.response.end_session = obj.end_session;
	}

	if (typeof obj.buttons === "object") {
		resp.response.buttons = [];
		for (let i = 0; i < obj.buttons.length; i++) {
			if (typeof obj.buttons[i] === "object") {
				resp.response.buttons.push(obj.buttons[i]);
			}
		}
		let dbut = defButtons();
		for (let i = 0; i < dbut.length; i++) {
			resp.response.buttons.push(makeButton(dbut[i]));
		}
	}

	if (is_null(this.id)) {
		this.id = req?.state[Config.STATE_REQUEST_KEY]?.scene;
	}
	resp[Config.STATE_RESPONSE_KEY] = {
		scene: is_null(this.id) ? '' : this.id,
		last_text: resp.response.text,
		last_tts: resp.response.tts,
	};

	if (resp.response.end_session === false) {
		if (typeof resp.response.buttons === "undefined") {
			resp.response.buttons = defButtons();
		}
	} else {
		delete resp.response.buttons;
	}

	//console.log('====> Result <====',resp);
	//console.log('Buttons',resp.response.buttons);
	return resp;
}

var fallback = function formFallBack(req, obj) {
	if (is_null(obj)) {
		obj = {};
	}
	let text = obj.text || null;
	let res = {
		text: randomPhrase([
			"Сожалею, но я Вас не поняла. Попробуйте уточнить свой вопрос.",
			"Простите, но я Вас не смогла понять. Пожалуйста, уточните Ваш вопрос.",
		])
	};

	if (!is_null(obj.tts)) {
		res.tts = obj.tts;
	}

	if (!is_null(obj.buttons)) {
		res.buttons = obj.buttons;
	}

	if (!is_null(text) && text.length > 0) {
		res.text = text;
	} else {
		if (!is_null(req?.request?.nlu?.intents?.fallback_exit)) {
			res.text = 'Если Вы хотите завершить экскурсию, то скажите "Алиса, хватит".';
		} else if (!is_null(req?.request?.nlu?.intents?.fallback_menu)) {
			res.text = 'Меню у меня нет, но есть команда "помощь".';
		} else if (!is_null(req?.request?.nlu?.intents?.fallback_enable)) {
			res.text = 'Сожалею, но я не могу этого сделать. Скажите "Алиса, хватит", чтобы выйти из навыка, а затем повторите ваш запрос.';
		} else if (!is_null(req?.request?.nlu?.intents?.fallback_vol) && typeof req?.meta?.interfaces?.screen === "object") {
			res.text = 'Сожалею, но я не могу управлять громкостью. Скажите "Алиса, хватит", чтобы выйти из навыка, а затем повторите ваш запрос.';
		}
	}

	console.log('Fallback on [' + req.request?.original_utterance + ']');
	return response(req, res);
}

module.exports = {
	make_response: response,
	make_fallback: fallback,
	randomPhrase: randomPhrase,
	is_null: is_null,
	makeButton: makeButton,
}

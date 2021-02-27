const Config = require('./config');
const Func = require('./functions');
const Commands = require('./commands');

var scene = function () {
	var self = this;

	this.id = '';

	this.response = Func.make_response;

	this.fallback = Func.make_fallback;

	this.reply = function defaultReply(req, obj) {
		return self.fallback(req, obj);
	}

	this.handle_local_intents = function handleLocalIntents(req, intents) {
		return false;
	}

	this.handle_global_intents = function handleGlobalIntents(req) {
		let intents = Config.GLOBAL_INTENTS;
		let hge = this.handle_intents(req, intents);
		if (hge === "YANDEX.WHAT_CAN_YOU_DO") {
			hge = "help";
		}
		if (!Func.is_null(hge)) {
			let cmd = hge.toLocaleLowerCase().replace(/yandex\./, '');
			if (typeof Commands[cmd] === "object") {
				return { func: Commands[cmd], type: 'reply' };
			}
		}
		return false;
	}

	this.handle_intents = function processIntents(req, intents) {
		if (typeof intents === "object") {
			for (let i = 0; i < intents.length; i++) {
				if (!Func.is_null(req?.request?.nlu?.intents[intents[i]])) {
					console.log('Handle intent [' + intents[i] + ']');
					return intents[i];
				}
			}
		}
		return false;
	}
}

get_place = function Place(req, place, self) {
	if (place === "tell_about_place") {
		let intent = req.request.nlu.intents.tell_about_place;
		if (typeof intent.slots?.place?.value !== "undefined") {
			place = intent.slots.place.value;
		}
	}

	if (place === "tower") {
		return { func: tower };
	} else if (place === "cathedral") {
		return { func: cathedral };
	} else {
		console.error('Unknown place [' + place + ']');
		return {
			func: self,
			type: 'fallback',
			argv: {
				text: "Сожалею, но мне пока неизвестно это место.",
				buttons: [
					Func.makeButton("Расскажи про башню"),
					Func.makeButton("Расскажи про собор")
				]
			}
		};
	}
}

var welcome = new scene();
welcome.reply = function Welcome(req) {
	let text = 'Добро пожаловать на экскурсию по кремлю Великого Новгорода. Начинаем?';
	if (req.session.new === false) {
		text = 'Начнём экскурсию?';
	}

	return this.response(
		req,
		{
			text: text,
			buttons: [
				Func.makeButton({ title: "Начинай" })
			],
		}
	);
}
welcome.handle_local_intents = function WelcomeIntents(req) {
	let local_intents = ['start_tour', 'YANDEX.CONFIRM'];
	let intent = this.handle_intents(req, local_intents);
	if (intent !== false) {
		return { func: start_tour, type: 'reply' };
	}

	local_intents = ['YANDEX.REJECT'];
	intent = this.handle_intents(req, local_intents);
	if (intent !== false) {
		return {
			func: Commands.exit
		};
	}

	intent = this.handle_global_intents(req);
	if (intent !== false) {
		return intent;
	}

	return {
		func: this,
		type: 'reply'
	};
}

var start_tour = new scene();
start_tour.id = 'start_tour';
start_tour.reply = function StartTour(req) {
	let res = {
		text: 'Возле какого места вы находитесь?',
		tts: 'Возле какого места вы находитесь?',
		buttons: [Func.makeButton("Башня"), Func.makeButton("Собор")],
	};
	if (typeof req?.meta?.interfaces?.screen === "object") {
		res.images = [
			'965417/48f0d72fa8cdf775fb45',
			'965417/af9d0a49d10becbd70d4'
		];
	}

	return this.response(req, res);
}
start_tour.fallback = function StartTourallback(req, obj) {
	if (Func.is_null(obj)) {
		obj = {
			text: Func.randomPhrase([
				"Сожалею, но я Вас не поняла. Попробуйте уточнить свой вопрос.",
				"Простите, но я Вас не смогла понять. Пожалуйста, уточните Ваш вопрос.",
			]) + ' Так возле какого места вы находитесь?',
			buttons: [
				Func.makeButton("Около башни"),
				Func.makeButton("Около собора")
			],
		};
	}

	return Func.make_fallback(req, obj);
}
start_tour.handle_local_intents = function StartTourIntents(req) {
	let local_intents = ['tell_about_place', 'tower', 'cathedral'];
	let intent = this.handle_intents(req, local_intents);
	if (intent !== false) {
		return get_place(req, intent, this);
	}

	return false;
}

var tower = new scene();
tower.id = 'tower';
tower.reply = function Tower(req) {
	return this.response(
		req,
		{
			text: 'Спасская башня — проездная башня Новгородского детинца, строение конца XV века. ' +
				'Башня шестиярусная, в плане представляет собой вытянутый прямоугольник 15 × 8,3 м.' +
				'Ширина проезда — 3 м. Высота стен — 19 м, а толщина стен на уровне второго яруса — 2 м.',
			tts: 'Спасская башня sil <[200]> проездная башня Новгородского дет+инца,строение конца пятнадцатого века.' +
				'Башня шестиярусная, в плане представляет собой вытянутый прямоугольник пятнадцать на восемь целых три десятых метра.' +
				'Ширина проезда sil <[100]> три метра. Высота стен sil <[100]> девятнадцать метров, а толщина стен на уровне второго яруса sil <[100]> 2 метра.',
			image: '965417/48f0d72fa8cdf775fb45',
			title: 'Спасская башня',
			buttons: [
				Func.makeButton("Расскажи про собор")
			],
		}
	);
}
tower.fallback = function TowerFallback(req, obj) {
	if (Func.is_null(obj)) {
		obj = {
			buttons: [
				Func.makeButton("Расскажи про башню"),
				Func.makeButton("Расскажи про собор")
			],
		};
	}

	return Func.make_fallback(req, obj);
}
tower.handle_local_intents = function TowerIntents(req) {
	let local_intents = ['tell_about_place', 'tower', 'cathedral'];
	let intent = this.handle_intents(req, local_intents);
	if (intent !== false) {
		return get_place(req, intent, this);
	}

	return false;
}

var cathedral = new scene();
cathedral.id = "cathedral";
cathedral.reply = function Cathedral(req) {
	return this.response(
		req,
		{
			text: 'Софийский собор представляет собой пятинефный крестово-купольный храм.' +
				'У храма имеется три апсиды — центральная пятигранная, и боковые — округлые. С трёх сторон центральное строение окружают широкие двухэтажные галереи.',
			sound: '<speaker audio="alice-sounds-things-bell-1.opus">',
			image: '965417/af9d0a49d10becbd70d4',
			title: 'Софийский собор',
			buttons: [
				Func.makeButton("Расскажи про башню")
			],
		}
	);
}
cathedral.fallback = function CathedralFallback(req, obj) {
	if (Func.is_null(obj)) {
		obj = {
			buttons: [
				Func.makeButton("Расскажи про собор"),
				Func.makeButton("Расскажи про башню")
			],
		};
	}

	return Func.make_fallback(req, obj);
}
cathedral.handle_local_intents = function CathedralIntents(req) {
	let local_intents = ['tell_about_place', 'tower', 'cathedral'];
	let intent = this.handle_intents(req, local_intents);
	if (intent !== false) {
		return get_place(req, intent, this);
	}

	return false;
}

module.exports = {
	welcome: welcome,
	start_tour: start_tour,
	tower: tower,
	cathedral: cathedral,
}

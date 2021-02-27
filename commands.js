const Func = require('./functions');

var help = {
	reply: function cmdHelp(req) {
		return Func.make_response(
			req,
			{
				text: "Это навык экскурсовод по кремлю Великого Новгорода.\n" +
					"Основные команды:\n" +
					"- расскажи про <МЕСТО>;\n" +
					"- повтори;\n" +
					"- выход;",
				tts: "Это навык экскурсовод по кремлю Великого Новгорода." +
					'Мои команды, расскажи пр+о, а далее добавьте название места, о котором вы хотите услышать, также команды: sil <[100]> повтори sil <[100]> выход.',
				buttons: [Func.makeButton("Расскажи про собор"), Func.makeButton("Расскажи про башню")],
			}
		);
	}
}

var exit = {
	reply: function cmdExit(req) {
		return Func.make_response(
			req,
			{
				text: "Обязательно возращайтесь! Мы продолжим нашу экскурсию.\nВсего Вам доброго.",
				end_session: true,
			}
		);
	}
}

var repeat = {
	reply: function cmdRepeat(req) {
		let res = {};
		if (!Func.is_null(req?.state?.session?.last_text)) {
			res.text = req.state.session.last_text;
		}
		if (!Func.is_null(req?.state?.session?.last_tts)) {
			res.tts = req.state.session.last_tts;
		}
		if (!res.text && !res.tts) {
			res = { text: 'Сожалею, но мне нечего повторить.' };
		}

		return Func.make_response(req, res);
	}
}

module.exports = {
	help: help,
	exit: exit,
	repeat: repeat,
}
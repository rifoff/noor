import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

BOT_TOKEN = "8520533346:AAGlpdW1u3RrhWnwMJ6wQsS50fshemgNP-o"
APP_URL = "https://t.me/noor_umra_bot/Noor"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_handler(message: types.Message):
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(
            text="Открыть Noor 🌙",
            web_app=types.WebAppInfo(url=APP_URL)
        )
    ]])
    
    await message.answer(
        "Ассаляму алейкум! 🌙\n\n"
        "Добро пожаловать в *Noor* — ваш трекер Рамадана.\n\n"
        "Нажмите кнопку ниже чтобы открыть приложение 👇",
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
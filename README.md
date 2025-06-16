# 🧩 #stuck — Task Manager

**#stuck** — это современный таск-менеджер, разработанный на базе **Django** + **Django REST Framework** (бэкенд) и **React** (фронтенд).  
Он поможет команде организовать проекты, задачи и назначить исполнителей.

## 🚀 Функционал

- 📝 **Создание и управление проектами**
- ✅ **Добавление задач к каждому проекту**
- 👥 **Привязка исполнителей к проектам**
- 📤 **Загрузка аватаров пользователей**
- 🔐 **Аутентификация и сессии через Django**
- 🌐 **API на Django REST Framework**
- ⚛️ **Интерфейс на React с авторизацией**

## 🛠️ Технологии

- 🐍 Django 5.x
- 🧰 Django REST Framework
- ⚛️ React + Vite
- 🎨 TailwindCSS (опционально)
- 🗃️ SQLite / PostgreSQL
- ☁️ WhiteNoise (для статики)
- 🖼️ Поддержка загрузки медиа (аватары и др.)

## 📦 Установка (локально)

```bash
git clone https://github.com/your-username/stuck.git
cd stuck/backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

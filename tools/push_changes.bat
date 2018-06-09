@echo off
git add -A
git commit -m "Automated update and deploy."
git push heroku master
heroku open
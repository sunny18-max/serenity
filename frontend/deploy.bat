@echo off
echo Deploying Serenity Frontend to Vercel...
set VERCEL_PROJECT_ID=
vercel --prod --force --yes

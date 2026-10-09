FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY cors.conf /etc/nginx/cors.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

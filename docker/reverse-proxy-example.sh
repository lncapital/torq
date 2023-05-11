docker run --name reverseproxy --mount type=bind,source=<absolutepath>/nginx.conf,target=/etc/nginx/nginx.conf,readonly -p 132:132 --rm nginx

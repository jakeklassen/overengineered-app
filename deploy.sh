# We're already logged in by the time this script is executed.

# Useful to have :latest and :$SHA (git) tags.
docker build -t jakeklassen/multi-client:latest -t jakeklassen/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t jakeklassen/multi-server:latest -t jakeklassen/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t jakeklassen/multi-worker:latest -t jakeklassen/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push jakeklassen/multi-client:latest
docker push jakeklassen/multi-client:$SHA
docker push jakeklassen/multi-server:latest
docker push jakeklassen/multi-server:$SHA
docker push jakeklassen/multi-worker:latest
docker push jakeklassen/multi-worker:$SHA

kubectl apply -f k8s
kubectl set image deployments/server-deployment server=jakeklassen/multi-server:$SHA
kubectl set image deployments/client-deployment client=jakeklassen/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=jakeklassen/multi-worker:$SHA

find . -iname "Dockerfile*" | grep -i -E "api|expense"

TAG="dev-$(date +%Y%m%d-%H%M%S)"
echo $TAG


docker buildx create --use --name expbuilder 2>/dev/null || docker buildx use expbuilder

docker buildx build \
  --platform linux/amd64 \
  -t acrexptrackerhqdev01.azurecr.io/expense-api:$TAG \
  -f ./apps/api/ExpenseTracker.Api/Dockerfile \
  --push \
  .

  az acr repository show-tags \
  --name acrexptrackerhqdev01 \
  --repository expense-api \
  --top 10 \
  -o table


tag: "dev-REPLACE_ME"


  helm upgrade --install expense-api infra/helm/expense-api -f infra/helm/expense-api/values-expense-dev.yaml


  kubectl rollout status deploy/expense-api


  kubectl get pods -n expense-dev -l app=expense-api -o jsonpath='{range .items[*]}{.metadata.name}{"  "}{.spec.containers[0].image}{"\n"}{end}'
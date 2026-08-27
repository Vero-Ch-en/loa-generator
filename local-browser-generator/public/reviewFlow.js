export function startConsultantReview(payload) {
  return { stage: "review", payload: { ...payload, reviewConfirmed: false } };
}

export function confirmConsultantReview(reviewState) {
  return { stage: "generating", payload: { ...reviewState.payload, reviewConfirmed: true } };
}

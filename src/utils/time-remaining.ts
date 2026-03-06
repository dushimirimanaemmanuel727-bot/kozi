export function getTimeRemaining(deadline: Date | string | null): string {
  if (!deadline) {
    return "No deadline";
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "Expired";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  } else {
    return "Less than 1 minute remaining";
  }
}

export function isExpired(deadline: Date | string | null): boolean {
  if (!deadline) {
    return false;
  }
  return new Date(deadline) <= new Date();
}

export function getDeadlineColor(deadline: Date | string | null): string {
  if (!deadline) {
    return "text-gray-500";
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "text-red-600 font-semibold";
  }

  const hours = diff / (1000 * 60 * 60);
  
  if (hours < 24) {
    return "text-orange-600 font-semibold";
  } else if (hours < 72) {
    return "text-yellow-600";
  } else {
    return "text-green-600";
  }
}

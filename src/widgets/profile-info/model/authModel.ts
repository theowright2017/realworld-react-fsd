import { createQuery } from '@farfetched/core';
import { Store, createEvent, sample } from 'effector';
import { profileApi } from '~entities/profile';
import { followModel, unfollowModel } from '~features/profile';

type AuthConfig = {
  $username: Store<string | null>;
};

export type AuthModel = ReturnType<typeof createAuthModel>;

export function createAuthModel(config: AuthConfig) {
  const { $username } = config;

  const init = createEvent();
  const unmounted = createEvent();
  const reset = createEvent();

  const profileQuery = createQuery({
    handler: profileApi.getProfileFx,
    name: 'profileQuery',
  });

  sample({
    clock: init,
    source: $username,
    filter: Boolean,
    fn: (username) => ({ username, params: { secure: true } }),
    target: profileQuery.start,
  });

  sample({
    clock: reset,
    target: profileQuery.reset,
  });

  sample({
    clock: unmounted,
    target: reset,
  });

  const $profile = profileQuery.$data;
  const { $pending } = profileQuery;
  const { $error } = profileQuery;

  const $$followProfile = followModel.createModel();
  const $$unfollowProfile = unfollowModel.createModel();

  sample({
    clock: [$$followProfile.mutated, $$unfollowProfile.mutated],
    target: $profile,
  });

  sample({
    clock: [$$followProfile.failure, $$unfollowProfile.failure],
    target: $error,
  });

  sample({
    clock: [$$followProfile.settled, $$unfollowProfile.settled],
    target: init,
  });

  return {
    init,
    unmounted,
    reset,
    $profile,
    $pending,
    $error,
    $$followProfile,
    $$unfollowProfile,
  };
}

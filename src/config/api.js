// Manually set this to 'development' or 'production'
const CURRENT_ENV = 'production';

const API_BASE_URLS = {
  development: {
    5052: 'http://localhost:5052',
    5000: 'http://localhost:5000',
    5054: 'http://localhost:5054',  // FaithJourney backend
    5051: 'http://localhost:5051',  // Chat API
    5053: 'http://localhost:5053',  // Investing API
    5040: 'http://localhost:5040',  // Stripe API
    5056: 'http://localhost:5056',  // Group API
  },
  production: {
    5052: 'https://crossvalidation.ai',
    5000: 'https://crossvalidation.ai',
    5054: 'https://crossvalidation.ai',  // FaithJourney backend
    5051: 'https://crossvalidation.ai',  // Chat API
    5053: 'https://crossvalidation.ai',  // Investing API
    5040: 'https://crossvalidation.ai',  // Stripe API
    5056: 'https://crossvalidation.ai',  // Group API
  }
};

const CURRENT_BASE_URLS = API_BASE_URLS[CURRENT_ENV];

export const API_ENDPOINTS = {
  // User-related endpoints
  USER_INFORMATION: `${CURRENT_BASE_URLS[5000]}/user-information`,
  LOGIN: `${CURRENT_BASE_URLS[5000]}/login`,
  GET_USER_ID: `${CURRENT_BASE_URLS[5000]}/get_user_id`,
  SIGNUP: `${CURRENT_BASE_URLS[5000]}/register`,
  USER_PROFILE: `${CURRENT_BASE_URLS[5052]}/api/user_profile`,
  
  // Gospel-related endpoints
  GOSPEL_REFLECTION: `${CURRENT_BASE_URLS[5052]}/api/gospel_reflection`,
  UPDATE_USER_PROFILE: `${CURRENT_BASE_URLS[5052]}/api/update_user_profile`,
  
  GET_ORGANIZATIONS: `${CURRENT_BASE_URLS[5052]}/api/organizations`,
  GET_CATEGORIES: `${CURRENT_BASE_URLS[5052]}/api/categories`,
  GET_RESOURCES: `${CURRENT_BASE_URLS[5052]}/api/resources`,
  
  // Chat-related endpoints
  RESEARCH_RESPONSE_COUNT: `${CURRENT_BASE_URLS[5051]}/get_research_response_count`,
  RESEARCH: `${CURRENT_BASE_URLS[5051]}/api/research`,

  CHECK_TOUR_STATUS: `${CURRENT_BASE_URLS[5052]}/check_tour_status`,
  UPDATE_TOUR_STATUS: `${CURRENT_BASE_URLS[5052]}/update_tour_status`,
  
  // FaithJourney-related endpoints
  USER_ASSESSMENT_STATUS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/assessment`,
  USER_CHALLENGES: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/challenges`,
  UPDATE_CHALLENGE: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/challenges`,
  FAITH_TREE: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/faith_tree`,
  COMMUNITY: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/community`,
  GOALS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/goals`,
  LEVEL_UP: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/level_up`,
  FAITH_CIRCLES: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/faith_circles`,
  JOIN_FAITH_CIRCLE: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/faith_circles/join`,
  USER_PROGRESS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/progress`,
  USER_LEVELS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/user_levels`,
  CHECK_COMPLETED_CHALLENGES: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/check_completed_challenges`,
  SELECT_NEW_CHALLENGE: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/select_new_challenge`,
  CHAT_RESPONSE_COUNT: `${CURRENT_BASE_URLS[5054]}/api/chat_response_count`,
  GROUP_MEMBERS: `${CURRENT_BASE_URLS[5054]}/api/group-members`,
  USER_PROFILE_DETAIL: `${CURRENT_BASE_URLS[5054]}/api/user-profile`,
  JOIN_GROUP_BY_LINK: `${CURRENT_BASE_URLS[5054]}/api/join-group-by-link`,
  EVENTS: `${CURRENT_BASE_URLS[5054]}/api/events`,
  GENERATE_PROMPTS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/generate_prompts`,
  
  // Catholic AI Rewards endpoints
  USER_POINTS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/user_points`,
  REFERRAL_CODE: `${CURRENT_BASE_URLS[5054]}/api/referral_code`,
  TOP_POINT_EARNERS: `${CURRENT_BASE_URLS[5054]}/api/top_point_earners`,
  CONVERT_POINTS: `${CURRENT_BASE_URLS[5054]}/api/convert_points`,
  REFER_USER: `${CURRENT_BASE_URLS[5054]}/api/refer`,
  AWARD_EVENT_POINTS: `${CURRENT_BASE_URLS[5054]}/api/award_event_points`,

  REFLECTIONS: `${CURRENT_BASE_URLS[5054]}/api/reflections`,

  // Additional FaithJourney-related endpoints
  UPDATE_PERSONAL_GOAL: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/update_personal_goal`,
  CHALLENGES: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/challenges`,
  REMOVE_PERSONAL_GOAL: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/remove_personal_goal`,
  REMOVE_CHALLENGE: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/remove_challenge`,
  COMMUNITY_EVENTS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/community_events`,
  PUBLIC_EVENTS: `${CURRENT_BASE_URLS[5054]}/api/events/public`,
  SUBMIT_ASSESSMENT_RESPONSES: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/assessment_responses`,
  SUBMIT_SELECTED_CHALLENGES: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/selected_challenges`,
  CHECK_IN_CHALLENGE: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/check_in_challenge`,
  CHECK_IN_PERSONAL_GOAL: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/check_in_personal_goal`,
  SUBMIT_ASSESSMENT: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/submit_assessment`,
  GET_FAITH_BANNER_PREFERENCE: `${CURRENT_BASE_URLS[5054]}/api/faith_banner_preference`,
  UPDATE_FAITH_BANNER_PREFERENCE: `${CURRENT_BASE_URLS[5054]}/api/faith_banner_preference`,
  GET_CHALLENGE_REFLECTIONS: `${CURRENT_BASE_URLS[5054]}/api/faith_journey/challenge_reflections`, // Remove the placeholders



  // Investing-related endpoints
  GET_ONBOARDING_STATUS: `${CURRENT_BASE_URLS[5053]}/get_onboarding_status`,
  INVEST_CHAT: `${CURRENT_BASE_URLS[5053]}/api/invest_chat`,
  AUTH_STATUS: `${CURRENT_BASE_URLS[5053]}/api/auth_status`,
  INITIATE_AUTH: `${CURRENT_BASE_URLS[5053]}/api/initiate_auth`,
  HANDLE_CALLBACK: `${CURRENT_BASE_URLS[5053]}/callbacks`,
  SUBSCRIPTION_STATUS: `${CURRENT_BASE_URLS[5053]}/subscription`,
  HANDLE_PENDING_ACTION: `${CURRENT_BASE_URLS[5053]}/api/handle_pending_action`,
  
  // Stripe-related endpoints
  CREATE_CHECKOUT_SESSION: `${CURRENT_BASE_URLS[5040]}/create-checkout-session`,
  GET_SUBSCRIPTION: `${CURRENT_BASE_URLS[5040]}/get_subscription`,
  UPDATE_SUBSCRIPTION: `${CURRENT_BASE_URLS[5040]}/update_subscription`,

  // Group-related endpoints (port 5056)
  CREATE_GROUP: `${CURRENT_BASE_URLS[5056]}/api/groups/create`,
  GET_GROUPS: `${CURRENT_BASE_URLS[5056]}/api/groups/list`,


  GET_PUBLIC_GROUPS: `${CURRENT_BASE_URLS[5056]}/api/groups/public`,
  JOIN_GROUP: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/join`,
  REQUEST_JOIN_PRIVATE_GROUP: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/request-join`,
  UPDATE_GROUP_PRIVACY: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/privacy`,
  GET_PENDING_REQUESTS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/pending-requests`,
  HANDLE_MEMBER_REQUEST: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/member-request`,
  SET_PRIMARY_GROUP: `${CURRENT_BASE_URLS[5056]}/api/users/:userId/primary_group`,
  USER_PRIMARY_GROUP: `${CURRENT_BASE_URLS[5056]}/api/users/:userId/get_primary_group`,


  GET_GROUP_FEED: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/feed`,
  GROUP_CHAT: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/chat`,
  GROUP_EVENTS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/events`,
  GROUP_REFLECTIONS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/reflections`,
  GROUP_CHALLENGES: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges`,

  GET_LEADER_POINTS: `${CURRENT_BASE_URLS[5056]}/api/leader-points/:userId`,
  INVITE_TO_GROUP: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/invite`,
  GET_ALL_USER_CHALLENGES: `${CURRENT_BASE_URLS[5056]}/api/user/:userId/all-challenges`,
  GET_ALL_USER_REFLECTIONS: `${CURRENT_BASE_URLS[5056]}/api/user/:userId/all-reflections`,
  GET_ALL_USER_EVENTS: `${CURRENT_BASE_URLS[5056]}/api/user/:userId/all-events`,
  GROUP_MEMBERS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/members`,
  UPDATE_GROUP_CHALLENGE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges/:userId`,
  AWARD_LEADER_POINTS: `${CURRENT_BASE_URLS[5056]}/api/leader-points/:userId`,

  CREATE_CUSTOM_GROUP_CHALLENGE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/custom-challenge`,

  GROUP_CHALLENGES_LIST: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges/list`,
  CREATE_GROUP_CHALLENGE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges`,
  GET_CHAT_OVERRIDE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/get_chat_override`,

  UPDATE_GROUP_SAMPLE_PROMPTS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/sample_prompts/update`,
  GET_GROUP_SAMPLE_PROMPTS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/sample_prompts/get`,


  JOIN_GROUP_CHALLENGE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges/:challengeId/join`,
  LEAVE_GROUP_CHALLENGE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges/:challengeId/leave`,
  GROUP_CHALLENGE_PARTICIPANTS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/challenges/:challengeId/participants`,

  // In config/api.js
  UPDATE_GROUP_CHAT_OVERRIDE: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/chat_override`,
  GET_GROUP_SETTINGS: `${CURRENT_BASE_URLS[5056]}/api/groups/:groupId/settings`,


};
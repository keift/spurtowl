export const config = {
  name: 'Keift',
  service_domain: 'id--api.keift.me',
  support_email: 'keifttt@gmail.com',
  api_base_url: '/',
  ws_base_url: '/',

  only_otp: false,
  sessions_validity: '28d',

  titles: {
    en_US: {
      otp: '[{PASSWORD}] Your one-time password',
      welcome: 'Welcome!',
      welcome_back: 'Welcome back!',
      session_ended_address_changed: 'Your session has ended',
      email_changed: 'Your email address has been changed',
      password_changed: 'Your password has been changed',
      account_deactivated: "We're sorry to see you go",
      account_reactivated: 'We are happy to see you!',
      account_suspended: 'Your account has been suspended',
      account_unsuspended: 'Good news!',
      account_deleted: 'Oh, no'
    },

    tr_TR: {
      otp: '[{PASSWORD}] Tek kullanımlık şifren',
      welcome: 'Hoş geldin!',
      welcome_back: 'Tekrar hoş geldin!',
      session_ended_address_changed: 'Oturumun sonlandırıldı',
      email_changed: 'E-posta adresiniz değiştirildi',
      password_changed: 'Şifreniz değiştirildi',
      account_deactivated: 'Gittiğine üzüldük',
      account_reactivated: 'Seni gördüğümüze sevindik!',
      account_suspended: 'Hesabınız askıya alındı',
      account_unsuspended: 'Haberler iyi!',
      account_deleted: 'Ah, hayır'
    }
  },

  messages: {
    en_US: {
      __EMAIL_TEMPLATE__: 'Hi {DISPLAY_NAME},\n\n{MESSAGE}\n\nBest regards,\nKeift Team',
      welcome: 'Welcome, we are delighted to have you with us!',
      welcome_back: 'Welcome back, we are delighted to have you with us again!',
      otp: 'Your one-time password to proceed with your operation is: {PASSWORD}\n\nIf you did not request this, please disregard this message.',
      session_ended_address_changed: 'We noticed a login from a different address and ended your session for security reasons.',
      email_changed: 'Your email address has been successfully changed.',
      password_changed: 'Your password has been successfully changed, and all your sessions have been terminated.',
      account_deactivated: 'Your account has been deactivated. If you wish, you can reactivate your account by logging in again.',
      account_reactivated: 'Your account has been reactivated! We knew you would come back.',
      account_suspended: "We regret to inform you that your account has been suspended. Please don't hesitate to contact us for more information.",
      account_unsuspended: "Your account has been reactivated. We're happy to see you back!",
      account_deleted: "It looks like you're leaving without looking back. Your account and everything related to you have been permanently deleted as per your request. Take care."
    },

    tr_TR: {
      __EMAIL_TEMPLATE__: 'Merhaba {DISPLAY_NAME},\n\n{MESSAGE}\n\nSaygılarımızla,\nKeift Ekibi',
      welcome: 'Hoş geldin, seni aramızda görmekten mutluluk duyuyoruz!',
      welcome_back: 'Tekrar hoş geldin, seni aramızda görmekten mutluluk duyuyoruz!',
      otp: 'İşlemine devam edebilmek için tek kullanımlık şifren: {PASSWORD}\n\nEğer bu işlemi siz gerçekleştirmediyseniz, lütfen bu mesajı dikkate almayın.',
      session_ended_address_changed: 'Başka bir adresten oturum açtığını fark ettik ve güvenlik sebebiyle oturumunu sonlandırdık.',
      email_changed: 'E-posta adresiniz başarıyla değişti.',
      password_changed: 'Şifreniz başarıyla değişti ve tüm oturumlarınız sonlandırıldı.',
      account_deactivated: 'Hesabınız devre dışı bırakıldı. İsterseniz tekrar giriş yaparak hesabınızı yeniden aktifleştirebilirsiniz.',
      account_reactivated: 'Hesabınız tekrardan aktif edildi! Geri döneceğini biliyorduk.',
      account_suspended: 'Hesabınız askıya alındığını üzülerek belirtmek isteriz. Daha fazla bilgi almak için bize ulaşmaktan çekinmeyin.',
      account_unsuspended: 'Hesabınız tekrar aktif edildi. Seni tekrar aramızda gördüğümüze sevindik!',
      account_deleted: 'Görünüşe göre arkana bakmadan gidiyorsun. Hesabın ve seninle ilgili her şey isteğin üzerine kalıcı olarak silindi. Kendine iyi bak.'
    }
  }
};

/**
 * auth.js
 * ─────────────────────────────────────────────────────
 * Capa de autenticación sobre Supabase Auth.
 * Usa `window._supabase` (creado por supabase.js).
 *
 * Expone el objeto global `Auth` con:
 *   Auth.login(email, password)
 *   Auth.logout()
 *   Auth.getUser()
 *   Auth.getRole()
 *   Auth.onAuthChange(callback)
 * ─────────────────────────────────────────────────────
 */
var Auth = (function () {
  function _sb() {
    return window._supabase;
  }

  return {
    /**
     * Login con email + contraseña (Supabase Auth).
     * @returns {{ user, error }}
     */
    async login(email, password) {
      var sb = _sb();
      if (!sb) return { user: null, error: { message: "Supabase no inicializado." } };

      var { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error };
      return { user: data.user, error: null };
    },

    /**
     * Cerrar sesión.
     */
    async logout() {
      var sb = _sb();
      if (sb) await sb.auth.signOut();
    },

    /**
     * Obtener el usuario autenticado actual (o null).
     */
    async getUser() {
      var sb = _sb();
      if (!sb) return null;
      var { data } = await sb.auth.getUser();
      return data?.user || null;
    },

    /**
     * Obtener el rol del usuario actual desde la tabla `profiles`.
     * @returns {"admin" | "user" | null}
     */
    async getRole() {
      var user = await this.getUser();
      if (!user) return null;

      var sb = _sb();
      var { data, error } = await sb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !data) return null;
      return data.role;
    },

    /**
     * Obtener el display_name del usuario actual.
     */
    async getDisplayName() {
      var user = await this.getUser();
      if (!user) return null;

      var sb = _sb();
      var { data } = await sb
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      return data?.display_name || user.email.split("@")[0];
    },

    /**
     * Escuchar cambios de estado de autenticación.
     * @param {function} callback - recibe (event, session)
     */
    onAuthChange(callback) {
      var sb = _sb();
      if (!sb) return;
      sb.auth.onAuthStateChange(callback);
    }
  };
})();
package com.Transitops.odoo.security;

import com.Transitops.odoo.entity.Role;
import com.Transitops.odoo.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final User user;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.user = user;
        this.email = readEmail(user);
        this.password = readPassword(user);
        this.authorities = readAuthorities(user);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;   // hum email ko username ki tarah use kar rahe hain
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    public User getUser() { return user; }

    private static String readEmail(User user) {
        return (String) readField(user, "email");
    }

    private static String readPassword(User user) {
        return (String) readField(user, "password");
    }

    private static Collection<? extends GrantedAuthority> readAuthorities(User user) {
        Object roleObject = readField(user, "role");
        Role role = (Role) roleObject;
        Object roleNameObject = readField(role, "roleName");
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleNameObject.toString()));
    }

    private static Object readField(Object target, String fieldName) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(target);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Unable to read field: " + fieldName, exception);
        }
    }
}

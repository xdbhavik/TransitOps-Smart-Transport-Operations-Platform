package com.Transitops.odoo.security;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:3000}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())   // REST API + JWT hai, session cookie nahi -> CSRF disable
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()   // register/login sabke liye open
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST")
                    .requestMatchers("/api/vehicles/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST", "DISPATCHER", "SAFETY_OFFICER")
                    .requestMatchers("/drivers/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST")
                    .requestMatchers("/api/trips", "/api/trips/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST")
                    .requestMatchers("/api/maintenance/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER")
                    .requestMatchers("/api/fuel/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST")
                    .requestMatchers("/api/expenses", "/api/expenses/**").hasAnyRole("ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST")
                        .requestMatchers("/ws-chat/**").permitAll()
                        .anyRequest().authenticated()              // baaki sab authenticated hone chahiye
                )
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // koi session store nahi hoga
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

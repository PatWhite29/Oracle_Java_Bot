package com.springboot.MyTodoList.config;


import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;


import javax.sql.DataSource;
import java.sql.SQLException;
///*
//    This class grabs the appropriate values for OracleDataSource,
//    The method that uses env, grabs it from the environment variables set
//    in the docker container. The method that uses dbSettings is for local testing
//    @author: peter.song@oracle.com
// */
//
//
@Configuration
public class OracleConfiguration {
    Logger logger = LoggerFactory.getLogger(DbSettings.class);
    @Autowired
    private DbSettings dbSettings;
    @Autowired
    private Environment env;

    @Bean
    public DataSource dataSource() throws SQLException{
        OracleDataSource ds = new OracleDataSource();
        String driverType = firstNonBlank(
                env.getProperty("oracle.jdbc.driver-type"),
                env.getProperty("ORACLE_JDBC_DRIVER_TYPE"),
                "thin");
        String url = firstNonBlank(
                env.getProperty("db_url"),
                env.getProperty("DB_URL"),
                env.getProperty("spring.datasource.url"),
                dbSettings.getUrl());
        String user = firstNonBlank(
                env.getProperty("db_user"),
                env.getProperty("DB_USER"),
                env.getProperty("spring.datasource.username"),
                dbSettings.getUsername());
        String password = firstNonBlank(
                env.getProperty("dbpassword"),
                env.getProperty("DB_PASSWORD"),
                env.getProperty("spring.datasource.password"),
                dbSettings.getPassword());

        if (isBlank(url) || isBlank(user) || isBlank(password)) {
            throw new IllegalStateException("Oracle DB configuration is incomplete. Set DB_URL, DB_USER and DB_PASSWORD.");
        }

        ds.setDriverType(driverType);
        ds.setURL(url);
        ds.setUser(user);
        ds.setPassword(password);

        logger.info("Using Oracle JDBC driver type {}", driverType);
        logger.info("Using Oracle JDBC URL {}", url);
        logger.info("Using Oracle DB user {}", user);
        return ds;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

/**
 * Copyright (c) YugaByte, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied.  See the License for the specific language governing permissions and limitations
 * under the License.
 *
 */
package org.yb.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.ConcurrentSkipListSet;

public final class EnvAndSysPropertyUtil {

  private static final Logger LOG = LoggerFactory.getLogger(EnvAndSysPropertyUtil.class);
  private static final ConcurrentSkipListSet<String> discrepanciesReportedForEnvVars =
      new ConcurrentSkipListSet<>();

  private EnvAndSysPropertyUtil() {
  }

  public static boolean isEnvVarOrSystemPropertyTrue(String envVarName, boolean defaultValue) {
    return StringUtil.isStringTrue(getEnvVarOrSystemProperty(envVarName), defaultValue);
  }

  public static boolean isEnvVarOrSystemPropertyTrue(String envVarName) {
    return isEnvVarOrSystemPropertyTrue(envVarName, false);
  }

  /**
   * Gets an environment variable or a system property. Environment variables take precedence.
   * If the environment variable name is e.g. "YB_SOME_VARIABLE", the corresponding system property
   * name is "yb.some.variable"
   *
   * @param envVarName environment variable name, e.g. YB_SOME_VARIABLE
   * @param defaultValue default value to return if neither environment variable nor the system
   *                     property is defined.
   */
  public static String getEnvVarOrSystemProperty(String envVarName, String defaultValue) {
    String systemPropertyName = envVarName.replaceAll("_", ".").toLowerCase();
    String envVarValue = System.getenv(envVarName);
    String systemPropertyValue = System.getProperty(systemPropertyName);
    if (envVarValue != null && systemPropertyValue != null &&
        !envVarValue.equals(systemPropertyValue) &&
        discrepanciesReportedForEnvVars.add(envVarName)) {
      LOG.warn(
          String.format(
              "Conflicting values for environment variable %s (%s) and system property %s (%s)",
              envVarName, envVarValue, systemPropertyName, systemPropertyValue));
    }

    if (envVarValue != null) {
      return envVarValue;
    }

    if (systemPropertyValue != null) {
      return systemPropertyValue;
    }

    return defaultValue;
  }

  public static String getEnvVarOrSystemProperty(String envVarName) {
    return getEnvVarOrSystemProperty(envVarName, null);
  }

  public static long getLongEnvVarOrSystemProperty(String envVarName, long defaultValue) {
    String strValue = getEnvVarOrSystemProperty(envVarName);
    if (strValue != null) {
      return Long.valueOf(strValue);
    }
    return defaultValue;
  }

}

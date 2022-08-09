package logger

import (
	"cloud.google.com/go/logging"
	"contrib.rocks/apps/api/internal/config"
)

var _ LoggerFactory = &factory{}

type factory struct {
	cfg    *config.Config
	client *logging.Client
}

func newLoggerFactory(cfg *config.Config, l *logging.Client) *factory {
	return &factory{cfg, l}
}

func (s *factory) Logger(name string) Logger {
	return &loggerWrapper{
		s.cfg,
		s.client.Logger(name, logging.CommonLabels(map[string]string{
			"environment": string(s.cfg.Env),
		})),
	}
}

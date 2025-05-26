package otel

import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/log"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

type LogProvider struct {
	provider *sdklog.LoggerProvider
	logger   log.Logger
}

func NewLogProvider(token, serviceName string) (*LogProvider, error) {
	conn, err := grpc.NewClient(
		"otel-grpc.kubiks.ai:443",
		grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(nil, "")),
	)
	if err != nil {
		return nil, err
	}

	logExporter, err := otlploggrpc.New(context.Background(),
		otlploggrpc.WithGRPCConn(conn),
		otlploggrpc.WithHeaders(map[string]string{
			"X-Kubiks-Key": token,
		}),
	)
	if err != nil {
		return nil, err
	}

	logProcessor := sdklog.NewBatchProcessor(logExporter, sdklog.WithExportMaxBatchSize(1))

	provider := sdklog.NewLoggerProvider(
		sdklog.WithProcessor(logProcessor),
	)

	logger := provider.Logger(serviceName)

	return &LogProvider{
		provider: provider,
		logger:   logger,
	}, nil
}

func (lp *LogProvider) EmitLogRecord(ctx context.Context, record log.Record) {
	lp.logger.Emit(ctx, record)
}

func (lp *LogProvider) Shutdown(ctx context.Context) error {
	return lp.provider.Shutdown(ctx)
}
